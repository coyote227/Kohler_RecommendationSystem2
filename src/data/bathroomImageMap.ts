// src/data/bathroomImageMap.ts
// Mapping of bathroom product SKUs or categories to external image URLs from the new Kohler catalogue.
// Populate with actual URLs as needed.

export const bathroomImageMap: Record<string, string> = {
  // Example SKU mappings
  "K-5401": "https://www.studiokohler.com/resources/technical-specifications/images/toilets/K-5401.jpg",
  "K-9871": "https://www.studiokohler.com/resources/technical-specifications/images/showers/K-9871.jpg",
  "K-1234": "https://www.studiokohler.com/resources/technical-specifications/images/bathtubs/K-1234.jpg",
  "K-2345": "https://www.studiokohler.com/resources/technical-specifications/images/faucets/K-2345.jpg",
  "K-5678": "https://www.studiokohler.com/resources/technical-specifications/images/vanities/K-5678.jpg",
  "K-9012": "https://www.studiokohler.com/resources/technical-specifications/images/mirrors/K-9012.jpg",
  "K-3456": "https://www.studiokohler.com/resources/technical-specifications/images/tiles/K-3456.jpg",
  // Category fallbacks (optional)
  "toilet": "https://www.studiokohler.com/resources/technical-specifications/images/toilets/default.jpg",
  "shower": "https://www.studiokohler.com/resources/technical-specifications/images/showers/default.jpg",
  "bathtub": "https://www.studiokohler.com/resources/technical-specifications/images/bathtubs/default.jpg",
  "faucet": "https://www.studiokohler.com/resources/technical-specifications/images/faucets/default.jpg",
  "vanity": "https://www.studiokohner.com/resources/technical-specifications/images/vanities/default.jpg",
  "mirror": "https://www.studiokohler.com/resources/technical-specifications/images/mirrors/default.jpg",
  "tile": "https://www.studiokohler.com/resources/technical-specifications/images/tiles/default.jpg",
};
