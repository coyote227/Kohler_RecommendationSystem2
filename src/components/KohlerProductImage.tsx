import React from 'react';
import { getProductSVG } from '../utils/productSVGs';

interface KohlerProductImageProps {
  src: string;
  alt: string;
  sku: string;
  category: string;
  className?: string;
}

export const KohlerProductImage: React.FC<KohlerProductImageProps> = ({
  src,
  alt,
  sku,
  category,
  className = "max-h-full max-w-full object-contain"
}) => {
  const fallbackSvg = getProductSVG(sku, category);

  // Use the local illustration so blocked external catalogue hosts cannot create failed requests.
  return (
    <img
      src={fallbackSvg}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
};
