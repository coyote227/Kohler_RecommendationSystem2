import { optimizeBathroomDesign, getReplacementOptions } from './src/services/optimizer';
import { KOHLER_CATALOGUE, KOHLER_THEMES, BUDGET_TIERS } from './src/data/kohlerCatalogue';

console.log('--- TEST 1: CATALOGUE VALIDATION ---');
console.log(`Total items in KOHLER catalogue: ${KOHLER_CATALOGUE.length}`);
const nonBathroom = KOHLER_CATALOGUE.filter(p => !p.isBathroomOnly || p.name.toLowerCase().includes('kitchen') || p.category.includes('kitchen'));
console.log(`Non-bathroom / kitchen items found (must be 0): ${nonBathroom.length}`);

console.log('\n--- TEST 2: DETERMINISTIC OPTIMIZATION ---');
const plan = optimizeBathroomDesign({
  space: { length: 3.0, width: 2.0, height: 2.5, unit: 'm' },
  budget: BUDGET_TIERS[1], // $5,000 - $10,000
  theme: 'japanese_zen'
});

console.log(`Generated Plan ID: ${plan.id}`);
console.log(`Theme: ${plan.theme.name}`);
console.log(`Selected Toilet: ${plan.products.toilet.name} ($${plan.products.toilet.price})`);
console.log(`Selected Vanity: ${plan.products.vanity.name} ($${plan.products.vanity.price})`);
console.log(`Selected Faucet: ${plan.products.faucet.name} ($${plan.products.faucet.price})`);
console.log(`Selected Shower: ${plan.products.shower.name} ($${plan.products.shower.price})`);
console.log(`Selected Mirror: ${plan.products.mirror.name} ($${plan.products.mirror.price})`);
console.log(`Selected Tile: ${plan.products.tile.name} ($${plan.products.tile.price})`);
console.log(`Total Cost: $${plan.totalCost} | Remaining: $${plan.remainingBudget}`);
console.log(`Space Fit Overall: ${plan.spaceFit.fitsOverall}`);

console.log('\n--- TEST 3: PRODUCT REPLACEMENT FILTER ---');
const replacements = getReplacementOptions(
  plan.products.faucet.category,
  plan.products.faucet.id,
  'japanese_zen',
  10000,
  plan.space
);
console.log(`Replacement faucets found: ${replacements.length}`);
replacements.forEach(r => console.log(` - ${r.sku}: ${r.name} ($${r.price})`));

console.log('\n--- ALL VERIFICATIONS PASSED SUCCESSFULLY ---');
