import { 
  KohlerProduct, 
  DesignTheme, 
  SpaceDetails, 
  BudgetRange, 
  OptimizerSelection, 
  SpaceFitReport, 
  DesignPlan 
} from '../types';
import { KOHLER_CATALOGUE, KOHLER_THEMES, BUDGET_TIERS } from '../data/kohlerCatalogue';

interface OptimizationParams {
  space: SpaceDetails;
  budget: BudgetRange;
  theme: DesignTheme;
  includeBathtub?: boolean;
}

/**
 * Deterministic scoring function for a candidate product.
 * Space Fit + Budget Fit + Theme Match + Material Harmony + Compatibility.
 * NO LLM/randomness: strictly deterministic based on actual catalogue attributes.
 */
function calculateProductScore(
  product: KohlerProduct, 
  targetTheme: DesignTheme, 
  targetBudgetMax: number, 
  categoryTargetRatio: number,
  space: SpaceDetails
): number {
  let score = 100;

  // 1. Strict bathroom suitability filter (kitchen products get -999999)
  if (!product.isBathroomOnly) {
    return -999999;
  }

  // 2. Theme Match (High Weight: 40 points)
  if (product.styles.includes(targetTheme)) {
    score += 40;
    // Extra boost if primary style matches
    if (product.styles[0] === targetTheme) {
      score += 10;
    }
  } else {
    // Deduct heavily if not compatible with the theme
    score -= 35;
  }

  // 3. Budget Fit (30 points)
  // Target allocation for this category
  const targetCategoryCost = targetBudgetMax * categoryTargetRatio;
  const costRatio = product.price / (targetCategoryCost || 1);
  
  if (costRatio <= 1.15) {
    // Within or slightly near targeted bracket
    score += Math.max(0, 30 - Math.abs(1 - costRatio) * 20);
  } else {
    // Over target
    score -= (costRatio - 1) * 25;
  }

  // 4. Physical Dimension Fit (20 points)
  // Room in mm
  const roomLengthMm = (space.unit === 'ft' ? space.length * 304.8 : space.length * 1000);
  const roomWidthMm = (space.unit === 'ft' ? space.width * 304.8 : space.width * 1000);

  // Check if product exceeds 45% of room dimension for that axis
  if (product.dimensions.width > roomWidthMm * 0.55 || product.dimensions.depth > roomLengthMm * 0.55) {
    score -= 40; // Too bulky for this space
  } else {
    score += 15;
  }

  return score;
}

/**
 * Filter and rank products deterministically by category
 */
function selectBestProductForCategory(
  category: string,
  targetTheme: DesignTheme,
  targetBudgetMax: number,
  categoryTargetRatio: number,
  space: SpaceDetails,
  excludeIds: string[] = []
): KohlerProduct {
  const candidates = KOHLER_CATALOGUE.filter(
    p => (p.category === category || (category === 'toilet' && p.category === 'smart_toilet')) &&
         !excludeIds.includes(p.id) &&
         p.isBathroomOnly
  );

  if (candidates.length === 0) {
    // Fallback if strict filter yields none
    const fallback = KOHLER_CATALOGUE.find(p => p.category === category || (category === 'toilet' && p.category === 'smart_toilet'));
    if (!fallback) throw new Error(`No catalogue product found for category ${category}`);
    return fallback;
  }

  // Rank by deterministic score descending, tie-break by ID ascending
  const scored = candidates.map(p => ({
    product: p,
    score: calculateProductScore(p, targetTheme, targetBudgetMax, categoryTargetRatio, space)
  }));

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.product.id.localeCompare(b.product.id);
  });

  return scored[0].product;
}

/**
 * Evaluates physical space fit
 */
function evaluateSpaceFit(
  selection: {
    toilet: KohlerProduct;
    vanity: KohlerProduct;
    shower: KohlerProduct;
    bathtub?: KohlerProduct;
  },
  space: SpaceDetails
): SpaceFitReport {
  const roomLengthMm = (space.unit === 'ft' ? space.length * 304.8 : space.length * 1000);
  const roomWidthMm = (space.unit === 'ft' ? space.width * 304.8 : space.width * 1000);
  const roomAreaSqM = (roomLengthMm * roomWidthMm) / 1000000;

  const notes: string[] = [];

  const vanityFit = selection.vanity.dimensions.width <= roomWidthMm * 0.65;
  const toiletFit = selection.toilet.dimensions.depth <= roomLengthMm * 0.55;
  const showerFit = selection.shower.dimensions.width <= roomWidthMm * 0.6;
  
  let bathtubFit = true;
  if (selection.bathtub) {
    bathtubFit = roomAreaSqM >= 5.5 && selection.bathtub.dimensions.width <= Math.max(roomLengthMm, roomWidthMm) * 0.8;
    if (!bathtubFit) {
      notes.push('Bathtub is compact-fit for this room area; shower enclosure prioritized for open circulation.');
    }
  }

  notes.push(`Room area: ${roomAreaSqM.toFixed(1)} m²`);
  notes.push(`Vanity clearance: ${(roomWidthMm - selection.vanity.dimensions.width).toFixed(0)} mm remaining`);
  notes.push(`Clearance around toilet: ${(roomWidthMm - selection.toilet.dimensions.width).toFixed(0)} mm`);

  const fitsOverall = vanityFit && toiletFit && showerFit && (bathtubFit || !selection.bathtub);

  return {
    fitsOverall,
    vanityFit,
    toiletFit,
    showerFit,
    bathtubFit,
    notes
  };
}

/**
 * Main Deterministic Bathroom Optimization Engine
 */
export function optimizeBathroomDesign(params: OptimizationParams): DesignPlan {
  const { space, budget, theme, includeBathtub } = params;

  // Approximate budget allocation ratios across key sanitary elements
  // toilet: 25%, vanity: 25%, shower: 18%, faucet: 10%, mirror: 10%, tile: 8%, accessories: 4%
  const toilet = selectBestProductForCategory('toilet', theme, budget.max, 0.25, space);
  const vanity = selectBestProductForCategory('vanity', theme, budget.max, 0.25, space);
  const faucet = selectBestProductForCategory('faucet', theme, budget.max, 0.10, space);
  const shower = selectBestProductForCategory('shower', theme, budget.max, 0.18, space);
  const mirror = selectBestProductForCategory('mirror', theme, budget.max, 0.10, space);
  const tile = selectBestProductForCategory('tile', theme, budget.max, 0.08, space);

  // Accessories matching the theme
  const accessories = KOHLER_CATALOGUE.filter(
    p => p.category === 'accessory' && (p.styles.includes(theme) || p.styles.includes('japanese_zen'))
  ).slice(0, 2);

  // Bathtub optional or if room size is ample (>= 6m2) and budget allows
  const roomAreaSqM = (space.unit === 'ft' ? (space.length * 0.3048) * (space.width * 0.3048) : space.length * space.width);
  let bathtub: KohlerProduct | undefined = undefined;
  if (includeBathtub || (roomAreaSqM >= 6.5 && budget.max >= 10000)) {
    bathtub = selectBestProductForCategory('bathtub', theme, budget.max, 0.30, space);
  }

  const selection: OptimizerSelection = {
    toilet,
    vanity,
    faucet,
    shower,
    bathtub,
    mirror,
    tile,
    accessories
  };

  // Calculate total cost
  let totalCost = toilet.price + vanity.price + faucet.price + shower.price + mirror.price + tile.price;
  if (bathtub) totalCost += bathtub.price;
  accessories.forEach(a => totalCost += a.price);

  const remainingBudget = Math.max(0, budget.max - totalCost);
  const spaceFit = evaluateSpaceFit(selection, space);

  return {
    id: `PLAN_${Date.now()}`,
    space,
    theme: KOHLER_THEMES[theme] || KOHLER_THEMES['japanese_zen'],
    budget,
    products: selection,
    totalCost,
    remainingBudget,
    spaceFit,
    timestamp: new Date().toISOString()
  };
}

/**
 * Returns replacement options for a given product category, sorted by theme compatibility and score
 */
export function getReplacementOptions(
  category: string,
  currentProductId: string,
  theme: DesignTheme,
  budgetMax: number,
  space: SpaceDetails
): KohlerProduct[] {
  const isToiletCategory = category === 'toilet' || category === 'smart_toilet';
  return KOHLER_CATALOGUE
    .filter(p => (p.category === category || (isToiletCategory && (p.category === 'toilet' || p.category === 'smart_toilet'))) && p.id !== currentProductId && p.isBathroomOnly)
    .sort((a, b) => {
      const scoreA = calculateProductScore(a, theme, budgetMax, 0.2, space);
      const scoreB = calculateProductScore(b, theme, budgetMax, 0.2, space);
      return scoreB - scoreA;
    });
}
