import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { optimizeBathroomDesign } from '../src/services/optimizer';
import { KOHLER_THEMES, BUDGET_TIERS, KOHLER_CATALOGUE } from '../src/data/kohlerCatalogue';
import type { DesignTheme, SpaceDetails, BudgetRange, KohlerProduct } from '../src/types';

const app = express();
const port = Number(process.env.PORT || 3001);
const openRouterApiKey = process.env.OPENROUTER_API_KEY;
const openRouterModel = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
const appUrl = process.env.APP_URL || 'http://localhost:5173';
const appTitle = process.env.OPENROUTER_APP_TITLE || 'KOHLER AI Bathroom Designer';
const openRouterCompletionUrl = 'https://openrouter.ai/api/v1/chat/completions';

app.use(cors());
app.use(express.json());

const sanitizeTheme = (theme: string): DesignTheme => {
  return theme in KOHLER_THEMES ? (theme as DesignTheme) : 'japanese_zen';
};

const parseBudget = (budget: number | undefined): BudgetRange => {
  if (typeof budget === 'number' && Number.isFinite(budget)) {
    const tier = BUDGET_TIERS.find((item) => item.min <= budget && item.max >= budget);
    if (tier) return tier;
  }
  return BUDGET_TIERS[1];
};

const calculateMatchScore = (product: KohlerProduct, theme: DesignTheme, budgetMax: number, space: SpaceDetails) => {
  let score = 0;
  if (product.styles.includes(theme)) score += 35;
  if (product.styles[0] === theme) score += 10;
  score += Math.max(0, 25 - Math.abs(product.price - budgetMax * 0.2) / 200);
  const roomLengthMm = (space.unit === 'ft' ? space.length * 304.8 : space.length * 1000);
  const roomWidthMm = (space.unit === 'ft' ? space.width * 304.8 : space.width * 1000);
  if (product.dimensions.width <= roomWidthMm * 0.55 && product.dimensions.depth <= roomLengthMm * 0.55) {
    score += 15;
  }
  score += product.features.length * 2;
  return score;
};

const buildOpenRouterAssistantSummary = async (
  cleanedSpace: SpaceDetails,
  cleanedBudget: BudgetRange,
  cleanedTheme: DesignTheme,
  preferences: string,
  plan: ReturnType<typeof optimizeBathroomDesign>
): Promise<string> => {
  if (!openRouterApiKey) {
    throw new Error('OpenRouter is not configured. Add OPENROUTER_API_KEY to .env and restart the backend.');
  }

  try {
    const response = await fetch(openRouterCompletionUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': appUrl,
        'X-OpenRouter-Title': appTitle
      },
      body: JSON.stringify({
        model: openRouterModel,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: 'You are a luxury bathroom design assistant. Keep the answer concise, polished, and practical. Mention the room dimensions, theme, budget, and recommended fixtures.'
          },
          {
            role: 'user',
            content: `Create a concise recommendation for a ${cleanedSpace.length}x${cleanedSpace.width} ${cleanedSpace.unit} bathroom. Theme: ${cleanedTheme}. Budget: ${cleanedBudget.label}. Preferences: ${preferences || 'Warm modern comfort and relaxation'}. Recommend a layout with these selected products: ${plan.products.toilet.name}, ${plan.products.vanity.name}, ${plan.products.shower.name}.`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter request failed (${response.status}). Check the API key, model, and account credits.`);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const summary = data.choices?.[0]?.message?.content?.trim();
    if (!summary) {
      throw new Error('OpenRouter returned no assistant response.');
    }

    return summary;
  } catch (error) {
    console.error('OpenRouter request failed:', error);
    throw error;
  }
};

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'kohler-ai-assistant', timestamp: new Date().toISOString() });
});

app.post('/api/recommendations', async (req, res) => {
  try {
    if (!openRouterApiKey) {
      res.status(503).json({
        ok: false,
        error: 'Unable to connect to OpenRouter: OPENROUTER_API_KEY is missing from .env.'
      });
      return;
    }

    const { space, budget, theme, preferences, includeBathtub } = req.body ?? {};
    const cleanedSpace: SpaceDetails = {
      length: Number(space?.length ?? 3),
      width: Number(space?.width ?? 2),
      height: Number(space?.height ?? 2.5),
      unit: space?.unit === 'ft' ? 'ft' : 'm'
    };
    const cleanedBudget = parseBudget(Number(budget ?? 7000));
    const cleanedTheme = sanitizeTheme(String(theme ?? 'japanese_zen'));

    const plan = optimizeBathroomDesign({
      space: cleanedSpace,
      budget: cleanedBudget,
      theme: cleanedTheme,
      includeBathtub: Boolean(includeBathtub ?? cleanedBudget.max >= 10000)
    });

    const productMatches = KOHLER_CATALOGUE.filter((product) => {
      if (!product.isBathroomOnly) return false;
      const text = [product.name, product.description ?? '', product.material, ...product.features].join(' ').toLowerCase();
      const keywords = (preferences ?? '').toString().toLowerCase();
      return !keywords || text.includes(keywords) || product.styles.includes(cleanedTheme);
    }).slice(0, 6).map((product) => ({
      ...product,
      matchScore: calculateMatchScore(product, cleanedTheme, cleanedBudget.max, cleanedSpace)
    })).sort((a, b) => b.matchScore - a.matchScore);

    const assistantSummary = await buildOpenRouterAssistantSummary(
      cleanedSpace,
      cleanedBudget,
      cleanedTheme,
      String(preferences ?? ''),
      plan
    );

    res.json({
      ok: true,
      plan,
      recommendations: productMatches,
      assistant: {
        summary: assistantSummary,
        provider: 'OpenRouter',
        model: openRouterModel,
        suggestions: [
          'Prioritize a floating vanity to create visual space.',
          'Use a warm LED halo for a softer Japanese Zen mood.',
          'Keep the shower glass clear to maximize light and openness.'
        ]
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(502).json({ ok: false, error: `Unable to connect to OpenRouter: ${message}` });
  }
});

app.listen(port, () => {
  console.log(`Kohler recommendation API running on http://localhost:${port}`);
  if (openRouterApiKey) {
    console.log(`OpenRouter enabled with model ${openRouterModel}`);
  } else {
    console.log('No OPENROUTER_API_KEY found. Requests will return a connection/configuration error.');
  }
});
