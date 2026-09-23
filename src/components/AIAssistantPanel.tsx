import React, { useMemo, useState } from 'react';
import { BrainCircuit, Sparkles, LoaderCircle } from 'lucide-react';
import type { BudgetRange, DesignTheme, SpaceDetails } from '../types';

interface AIAssistantPanelProps {
  space: SpaceDetails;
  theme: DesignTheme;
  budget: BudgetRange;
}

interface RecommendationApiResponse {
  assistant?: {
    summary?: unknown;
    provider?: unknown;
    model?: unknown;
  } | null;
}

const renderInlineFormatting = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={index} className="font-semibold text-neutral-900">{part.slice(2, -2)}</strong>
    ) : part
  );
};

const FormattedAssistantResponse: React.FC<{ summary: string }> = ({ summary }) => (
  <div className="space-y-2">
    {summary.split(/\r?\n/).filter(Boolean).map((line, index) => {
      if (line.startsWith('## ')) {
        return <h4 key={index} className="pt-1 text-base font-semibold text-neutral-950">{renderInlineFormatting(line.slice(3))}</h4>;
      }
      if (line.startsWith('### ')) {
        return <h5 key={index} className="pt-2 text-sm font-semibold text-neutral-900">{renderInlineFormatting(line.slice(4))}</h5>;
      }
      if (line.startsWith('- ')) {
        return <p key={index} className="pl-4 before:absolute before:-ml-3 before:content-['•']">{renderInlineFormatting(line.slice(2))}</p>;
      }
      const numberedItem = line.match(/^(\d+)\.\s+(.*)$/);
      if (numberedItem) {
        return <p key={index} className="pl-6"><span className="-ml-6 inline-block w-6">{numberedItem[1]}.</span>{renderInlineFormatting(numberedItem[2])}</p>;
      }
      return <p key={index}>{renderInlineFormatting(line)}</p>;
    })}
  </div>
);

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ space, theme, budget }) => {
  const [prompt, setPrompt] = useState('I want a spa-like bathroom with warm wood, hidden storage, and a touchless smart toilet.');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ summary: string; provider?: string; model?: string } | null>(null);

  const assistantTitle = useMemo(() => {
    return `AI Assistant · ${theme.replace('_', ' ')}`;
  }, [theme]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          space,
          budget: budget.max,
          theme,
          preferences: prompt,
          includeBathtub: budget.max >= 10000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(errorData?.error || `Assistant request failed (${response.status})`);
      }

      const data = await response.json() as RecommendationApiResponse;
      const summary = data.assistant?.summary;
      if (typeof summary !== 'string' || !summary.trim()) {
        throw new Error('OpenRouter returned no assistant response.');
      }

      setResult({
        summary,
        provider: typeof data.assistant?.provider === 'string' ? data.assistant.provider : undefined,
        model: typeof data.assistant?.model === 'string' ? data.assistant.model : undefined
      });
    } catch (error) {
      console.error('AI recommendation request failed:', error);
      setResult({ summary: error instanceof Error ? error.message : 'Unable to connect to the recommendation API.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl border border-neutral-200 rounded-3xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-neutral-900 text-white flex items-center justify-center">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-500">Smart assistant</p>
            <h3 className="text-base font-semibold text-neutral-900">{assistantTitle}</h3>
          </div>
        </div>
        <Sparkles className="w-4 h-4 text-[#c89d6c]" />
      </div>

      <textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        rows={4}
        className="w-full border border-neutral-200 rounded-2xl bg-neutral-50 px-3 py-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
        placeholder="Tell the assistant about your preferred mood, materials, or functional needs..."
      />

      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="mt-4 w-full rounded-2xl bg-neutral-950 text-white py-3 text-sm font-medium hover:bg-black transition disabled:opacity-70"
      >
        {isLoading ? (
          <span className="inline-flex items-center justify-center gap-2">
            <LoaderCircle className="w-4 h-4 animate-spin" />
            Generating design guidance...
          </span>
        ) : (
          'Ask AI for a design recommendation'
        )}
      </button>

      <div className="mt-4 rounded-2xl bg-[#f7f5f2] border border-[#e7dfd3] p-4 text-sm text-neutral-700 leading-relaxed min-h-[100px]">
        {result ? (
          <>
            {result.provider && result.model && (
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Generated by {result.provider} · {result.model}
              </p>
            )}
            <FormattedAssistantResponse summary={result.summary} />
          </>
        ) : 'The assistant will combine your room dimensions, budget, and styling goals into a tailored recommendation.'}
      </div>
    </div>
  );
};
