import React, { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, ExternalLink } from 'lucide-react';
import { KOHLER_CATALOGUE, KOHLER_THEMES } from '../data/kohlerCatalogue';
import { DesignTheme, KohlerProduct } from '../types';
import { KohlerProductImage } from './KohlerProductImage';

interface CatalogueRecommendationsProps {
  onSelectProduct: (product: KohlerProduct) => void;
}

const categories = ['all', 'toilet', 'smart_toilet', 'vanity', 'faucet', 'shower', 'bathtub', 'mirror', 'tile', 'accessory'];

export const CatalogueRecommendations: React.FC<CatalogueRecommendationsProps> = ({ onSelectProduct }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [theme, setTheme] = useState<DesignTheme | 'all'>('all');
  const [budget, setBudget] = useState(10000);

  const recommendations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return KOHLER_CATALOGUE
      .filter(product => category === 'all' || product.category === category)
      .filter(product => theme === 'all' || product.styles.includes(theme))
      .filter(product => product.price <= budget)
      .filter(product => !normalizedQuery || [product.name, product.series, product.sku, product.finish].filter(Boolean).some(value => value!.toLowerCase().includes(normalizedQuery)))
      .sort((a, b) => a.price - b.price);
  }, [budget, category, query, theme]);

  return (
    <main className="max-w-7xl mx-auto w-full px-6 py-10">
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-neutral-200">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#a4774e] font-semibold">KOHLER catalogue</p>
          <h1 className="mt-2 text-4xl font-serif-luxury text-neutral-950">Recommendations for your room</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
            Browse bathroom-only Kohler products matched by category, design language, and budget.
          </p>
        </div>
        <div className="text-sm text-neutral-500">{recommendations.length} products match</div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 py-8">
        <aside className="h-fit bg-white border border-neutral-200 rounded-2xl p-5 space-y-6 lg:sticky lg:top-28">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
            <SlidersHorizontal className="w-4 h-4" /> Refine recommendations
          </div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Search
            <div className="mt-2 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
              <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Name, SKU, finish" className="w-full rounded-xl border border-neutral-200 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-neutral-500" />
            </div>
          </label>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Category
            <select value={category} onChange={event => setCategory(event.target.value)} className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm bg-white">
              {categories.map(value => <option key={value} value={value}>{value === 'all' ? 'All products' : value.replace('_', ' ')}</option>)}
            </select>
          </label>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Design theme
            <select value={theme} onChange={event => setTheme(event.target.value as DesignTheme | 'all')} className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm bg-white">
              <option value="all">All themes</option>
              {Object.values(KOHLER_THEMES).map(value => <option key={value.id} value={value.id}>{value.name}</option>)}
            </select>
          </label>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Maximum price
            <input type="range" min="500" max="15000" step="250" value={budget} onChange={event => setBudget(Number(event.target.value))} className="mt-4 w-full accent-[#a4774e]" />
            <span className="mt-2 block text-sm font-semibold text-neutral-900">Up to ${budget.toLocaleString()}</span>
          </label>
        </aside>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {recommendations.map(product => (
            <article key={product.id} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden flex flex-col">
              <div className="h-52 bg-neutral-50 p-5">
                <KohlerProductImage src={product.image} alt={product.name} sku={product.sku} category={product.category} className="w-full h-full object-contain" />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-[10px] uppercase tracking-wider text-neutral-400">{product.category.replace('_', ' ')} · {product.sku}</p>
                <h2 className="mt-2 text-base font-semibold leading-5 text-neutral-950">{product.name}</h2>
                <p className="mt-2 text-xs text-neutral-500 line-clamp-2">{product.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {product.styles.slice(0, 3).map(style => <span key={style} className="rounded-full bg-neutral-100 px-2 py-1 text-[10px] text-neutral-600">{style.replace('_', ' ')}</span>)}
                </div>
                <div className="mt-auto pt-5 flex items-center justify-between gap-3">
                  <strong className="text-lg text-neutral-950">${product.price.toLocaleString()}</strong>
                  <button onClick={() => onSelectProduct(product)} className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-950 px-3 py-2 text-xs font-semibold text-white hover:bg-neutral-700">
                    View details <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
          {recommendations.length === 0 && <div className="col-span-full py-20 text-center text-sm text-neutral-500">No catalogue products match those filters.</div>}
        </div>
      </section>
    </main>
  );
};
