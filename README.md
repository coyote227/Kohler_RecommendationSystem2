# KOHLER AI Bathroom Designer & Planner
## Readme left to revise
An interactive 3D bathroom design tool that uses KOHLER catalogue data to recommend bathroom products based on:

* Bathroom dimensions
* Budget
* Design theme

The selected products are then displayed in an interactive **Three.js** bathroom.

## Features

* KOHLER catalogue-based product selection
* Deterministic product recommendation
* Bathroom space and budget filtering
* KOHLER bathroom 3D assets
* Visible floor and wall tiles
* Interactive 3D bathroom
* Rotate, zoom and pan
* Product replacement
* Theme-based redesign
* Product images and pricing
* Minimal, dark UI

## Architecture

```text
KOHLER Catalogue
       ↓
Product / Theme Data
       ↓
Optimization Engine
       ↓
Selected Product IDs
       ↓
3D Asset Mapping
       ↓
Three.js Bathroom
```

## Tech Stack

* React
* Vite
* Three.js
* JavaScript / TypeScript
* JSON / CSV
* GLB / GLTF

## Project Structure

```text
<!-- Add project file structure here -->
```

## How to Run

```text
<!-- Add installation and run commands here -->
```

## Deployment

The project is designed to be deployable through **GitHub Pages**.

## Important

* Only use products present in the supplied KOHLER catalogue.
* Do not invent product specifications or prices.
* Only use appropriate bathroom products.
* Kitchen or unrelated 3D assets must not be used.
* The optimizer selects products; Three.js only renders them.
* If a 3D model is unavailable, an appropriately sized placeholder can be used.

## 3D Assets

KOHLER 3D assets may be sourced from the relevant KOHLER 3D Warehouse collection, subject to applicable permissions and licenses.

## Disclaimer

This is a **conceptual bathroom design tool**, not a construction or CAD planning system.
