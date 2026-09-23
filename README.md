# KOHLER AI Bathroom Designer

This conceptual prototype explores bathroom recommendations, catalogue browsing, and interactive 3D planning.

## Project Materials

- `prompts/`: AI prompts and project prompt history.
- `video/`: demonstration and presentation video files.
- `ppt/`: presentation slides and supporting material.

## What It Does

- Accepts bathroom dimensions, budget, and design theme.
- Selects products from the local KOHLER catalogue.
- Checks basic space and fixture compatibility.
- Builds a procedural Three.js bathroom with fixtures, walls, door, lighting, and tiles.
- Supports 3D rotation, zoom, pan, and a 2D plan view.
- Offers theme-based lighting, tile patterns, product replacement, recommendations, and PDF export.
- Includes a shower for standard budgets and adds a bathtub in the two highest tiers.

## Run Locally

Requirements: Node.js 18 or newer.

To enable OpenRouter-powered assistant responses, add your key to `.env`:

```env
OPENROUTER_API_KEY=your_openrouter_key_here
```

`.env` is ignored by Git. You can use `.env.example` as the starting template. Without a valid key, the app displays an OpenRouter connection/configuration error rather than a fallback recommendation.

```bash
npm install
npm run dev
```

Open the Vite URL, usually `http://localhost:5138`.

## Validate

```bash
npm run build
npm run lint
```

## Evaluation Focus

### Approach & Innovation —

- Explainable catalogue ranking based on theme, budget, dimensions, and bathroom suitability.
- Procedural 3D modeling instead of unreliable external assets.
- Theme-aware layout, lighting, tiles, and bathing packages.

### Technical Execution — 

- React, TypeScript, Vite, and Three.js architecture.
- Dimension-aware placement, 2D/3D cameras, controls, replacement logic, and validation scripts.

### User Experience & Feasibility — 

- Guided design form, recommendations page, filters, interactive room, product replacement, and product-cost PDF export.

### Business & Sustainability Impact — 

- Uses KOHLER catalogue products and encourages decisions based on budget, fit, durability, and design intent.
- Sustainability claims are illustrative and must be verified against official product documentation.

## Project Structure

```text
src/components/   UI, recommendations, configurator, 2D/3D viewer
src/data/         KOHLER catalogue and themes
src/services/     Recommendation and replacement logic
src/types/        Shared TypeScript types
src/utils/        Procedural Three.js fixtures and product illustrations
public/           Favicon and interface icons
```

## Controls

- Left drag: rotate
- Mouse wheel: zoom
- Right drag: pan
- 2D Plan: top-down layout
- Reset Perspective: restore the default camera
- Product cards: open replacement options

## Disclaimer

Prices and product specifications come from the local educational catalogue data and should be confirmed with KOHLER before use. Catalogue names and product content remain subject to KOHLER ownership and review.
