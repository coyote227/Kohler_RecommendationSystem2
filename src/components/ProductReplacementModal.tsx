import React from 'react';
import { KohlerProduct, DesignTheme, SpaceDetails } from '../types';
import { getReplacementOptions } from '../services/optimizer';
import { KohlerProductImage } from './KohlerProductImage';
import { X, ArrowRight } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProduct: KohlerProduct | null;
  theme: DesignTheme;
  budgetMax: number;
  space: SpaceDetails;
  onSelectReplacement: (product: KohlerProduct) => void;
}

export const ProductReplacementModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  currentProduct,
  theme,
  budgetMax,
  space,
  onSelectReplacement
}) => {
  if (!isOpen || !currentProduct) return null;

  const replacements = getReplacementOptions(
    currentProduct.category,
    currentProduct.id,
    theme,
    budgetMax,
    space
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#161719] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#1c1d20]">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#c89d6c] font-semibold">
              Customize Fixture
            </span>
            <h3 className="text-lg font-medium text-white">
              Replace {currentProduct.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white rounded-full hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Item Banner */}
        <div className="p-4 mx-6 my-4 bg-white/5 border border-white/10 rounded-xl flex items-center space-x-4">
          <div className="w-16 h-16 bg-white rounded-lg p-1.5 flex-shrink-0 flex items-center justify-center overflow-hidden border border-neutral-100">
            <KohlerProductImage
              src={currentProduct.image}
              alt={currentProduct.name}
              sku={currentProduct.sku}
              category={currentProduct.category}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/80 uppercase font-mono">Current Choice</span>
              <span className="text-xs text-white/50">{currentProduct.sku}</span>
            </div>
            <p className="text-sm font-medium text-white truncate mt-0.5">{currentProduct.name}</p>
            <p className="text-xs text-[#c89d6c] font-medium">${currentProduct.price.toLocaleString()}</p>
          </div>
        </div>

        {/* Candidate Replacements from Authentic Kohler Catalogue */}
        <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-6">
          <p className="text-xs text-white/60 font-medium">Compatible authentic KOHLER options:</p>

          {replacements.length === 0 ? (
            <p className="text-sm text-white/40 py-8 text-center">No alternative models currently in catalogue for this category.</p>
          ) : (
            replacements.map((prod) => {
              const priceDiff = prod.price - currentProduct.price;
              const isMatchTheme = prod.styles.includes(theme);

              return (
                <div
                  key={prod.id}
                  onClick={() => {
                    onSelectReplacement(prod);
                    onClose();
                  }}
                  className="group cursor-pointer p-3.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/20 rounded-xl flex items-center space-x-4 transition-all"
                >
                  <div className="w-16 h-16 bg-white rounded-lg p-1.5 flex-shrink-0 flex items-center justify-center overflow-hidden border border-neutral-100">
                    <KohlerProductImage
                      src={prod.image}
                      alt={prod.name}
                      sku={prod.sku}
                      category={prod.category}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-white/60">{prod.sku}</span>
                      {isMatchTheme && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                          Theme Match
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-medium text-white group-hover:text-[#c89d6c] transition-colors truncate mt-0.5">
                      {prod.name}
                    </h4>
                    <p className="text-xs text-white/40 truncate">
                      {prod.material} • {prod.finish}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-semibold text-white block">
                      ${prod.price.toLocaleString()}
                    </span>
                    <span className={`text-[11px] ${priceDiff > 0 ? 'text-amber-400' : priceDiff < 0 ? 'text-emerald-400' : 'text-white/40'}`}>
                      {priceDiff > 0 ? `+$${priceDiff}` : priceDiff < 0 ? `-$${Math.abs(priceDiff)}` : 'Same price'}
                    </span>
                  </div>

                  <div className="pl-2">
                    <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-[#c89d6c] group-hover:text-black text-white/60 flex items-center justify-center transition">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
