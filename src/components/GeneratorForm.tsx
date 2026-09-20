import React from 'react';
import { SpaceDetails, DesignTheme, BudgetRange } from '../types';
import { KOHLER_THEMES, BUDGET_TIERS } from '../data/kohlerCatalogue';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { SafeImage } from './SafeImage';

interface GeneratorFormProps {
  space: SpaceDetails;
  setSpace: React.Dispatch<React.SetStateAction<SpaceDetails>>;
  theme: DesignTheme;
  setTheme: React.Dispatch<React.SetStateAction<DesignTheme>>;
  budget: BudgetRange;
  setBudget: React.Dispatch<React.SetStateAction<BudgetRange>>;
  onGenerate: () => void;
  isLoading?: boolean;
}

export const GeneratorForm: React.FC<GeneratorFormProps> = ({
  space,
  setSpace,
  theme,
  setTheme,
  budget,
  setBudget,
  onGenerate,
  isLoading
}) => {
  return (
    <div className="bg-white rounded-3xl p-8 md:p-10 border border-black/5 shadow-xl max-w-xl w-full">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">
          Tell us about your bathroom
        </h2>
        <p className="text-sm text-neutral-500 mt-1.5 leading-relaxed">
          Enter your space details and preferences, and we'll create a personalized design using real KOHLER products.
        </p>
      </div>

      {/* 1. Space Dimensions */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-2.5">
          Bathroom dimensions
        </label>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] text-neutral-500 mb-1 block">Length</label>
            <input
              type="number"
              step="0.1"
              min="1.5"
              max="10"
              value={space.length}
              onChange={(e) => setSpace(prev => ({ ...prev, length: parseFloat(e.target.value) || 2.5 }))}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="text-[11px] text-neutral-500 mb-1 block">Width</label>
            <input
              type="number"
              step="0.1"
              min="1.2"
              max="8"
              value={space.width}
              onChange={(e) => setSpace(prev => ({ ...prev, width: parseFloat(e.target.value) || 2.0 }))}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] text-neutral-500">Height (optional)</label>
              <select
                value={space.unit}
                onChange={(e) => setSpace(prev => ({ ...prev, unit: e.target.value as 'm' | 'ft' }))}
                className="text-[10px] font-semibold text-neutral-600 bg-transparent cursor-pointer"
              >
                <option value="m">m</option>
                <option value="ft">ft</option>
              </select>
            </div>
            <input
              type="number"
              step="0.1"
              min="2.0"
              max="4.0"
              value={space.height}
              onChange={(e) => setSpace(prev => ({ ...prev, height: parseFloat(e.target.value) || 2.5 }))}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
            />
          </div>
        </div>
      </div>

      {/* 2. Budget Selection */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-2.5">
          Budget (USD)
        </label>
        <select
          value={budget.id}
          onChange={(e) => {
            const selected = BUDGET_TIERS.find(b => b.id === e.target.value);
            if (selected) setBudget(selected);
          }}
          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black transition cursor-pointer"
        >
          {BUDGET_TIERS.map(b => (
            <option key={b.id} value={b.id}>{b.label}</option>
          ))}
        </select>
      </div>

      {/* 3. Design Theme Cards (Matching Reference Image #1) */}
      <div className="mb-8">
        <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-3">
          Design theme
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.values(KOHLER_THEMES).map((t) => {
            const isSelected = theme === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setTheme(t.id as DesignTheme)}
                className={`group cursor-pointer rounded-2xl overflow-hidden border transition-all duration-200 flex flex-col ${
                  isSelected
                    ? 'border-neutral-900 ring-2 ring-neutral-900 bg-neutral-50 shadow-md'
                    : 'border-neutral-200 hover:border-neutral-400 bg-white'
                }`}
              >
                <div className="h-24 w-full overflow-hidden relative">
                  <SafeImage
                    src={t.previewImage}
                    alt={t.name}
                    fallbackText={t.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-black text-white p-1 rounded-full shadow">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <div className="p-3 text-left min-h-[52px] flex items-center">
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 shrink-0 rounded-full border flex items-center justify-center ${isSelected ? 'border-black' : 'border-neutral-300'}`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-black" />}
                    </div>
                    <span className="text-sm leading-5 font-semibold text-neutral-900">
                      {t.name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Generate CTA Button */}
      <button
        onClick={onGenerate}
        disabled={isLoading}
        className="w-full py-4 px-6 bg-neutral-950 hover:bg-black text-white font-medium text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2.5 active:scale-[0.99] disabled:opacity-75"
      >
        <span>Generate My Bathroom Design</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
