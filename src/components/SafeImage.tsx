import React, { useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className,
  fallbackText,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className={`flex flex-col items-center justify-center bg-neutral-800 text-white/70 p-2 text-center select-none ${className || ''}`}>
        <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-300">
          {fallbackText || alt || 'KOHLER'}
        </span>
        <span className="text-[9px] text-neutral-400 font-mono mt-0.5">Design Theme</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      loading="lazy"
      {...props}
    />
  );
};
