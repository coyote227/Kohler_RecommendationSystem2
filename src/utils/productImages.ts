// src/utils/productImages.ts
// This module provides a unified way to retrieve product images.
// It first attempts to return an external image URL from the new Kohler catalogue.
// If no external image is found for the given SKU or category, it falls back to the existing SVG generator.

import { bathroomImageMap } from '../data/bathroomImageMap';
import { getProductSVG } from './productSVGs';

/**
 * Returns an image URL (external image or generated SVG) for the given product.
 * @param sku Product SKU identifier.
 * @param category Product category (e.g., "toilet", "shower", etc.).
 */
export function getProductImage(sku: string, category: string): string {
  // Direct SKU mapping takes priority.
  if (bathroomImageMap[sku]) {
    return bathroomImageMap[sku];
  }
  // Category fallback mapping (e.g., "toilet" -> default toilet image).
  const catKey = category?.toLowerCase();
  if (catKey && bathroomImageMap[catKey]) {
    return bathroomImageMap[catKey];
  }
  // Fallback to the existing SVG generation.
  return getProductSVG(sku, category);
}
