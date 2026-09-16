import React, { useState } from 'react';
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
  const [hasError, setHasError] = useState(false);
  const fallbackSvg = getProductSVG(sku, category);

  // If the remote image throws 403 or fails to load, seamlessly display the crisp Kohler product vector illustration
  return (
    <img
      src={hasError ? fallbackSvg : src}
      alt={alt}
      onError={() => setHasError(true)}
      className={className}
      loading="lazy"
    />
  );
};
