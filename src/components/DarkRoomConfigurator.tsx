import React, { useState } from 'react';
import { DesignPlan, KohlerProduct, DesignTheme, SpaceDetails, BudgetRange } from '../types';
import { KOHLER_THEMES, BUDGET_TIERS } from '../data/kohlerCatalogue';
import { BathroomViewer3D } from './BathroomViewer3D';
import { KohlerProductImage } from './KohlerProductImage';
import { SafeImage } from './SafeImage';
import { 
  Box, 
  Layers, 
  Sparkles, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  ArrowLeft, 
  Compass, 
  RefreshCw,
  Eye,
  SlidersHorizontal
} from 'lucide-react';

interface DarkRoomConfiguratorProps {
  plan: DesignPlan;
  onUpdatePlanParams: (space: SpaceDetails, budget: BudgetRange, theme: DesignTheme) => void;
  onSelectProductForReplacement: (product: KohlerProduct) => void;
  onBackToOverview: () => void;
}

export const DarkRoomConfigurator: React.FC<DarkRoomConfiguratorProps> = ({
  plan,
  onUpdatePlanParams,
  onSelectProductForReplacement,
  onBackToOverview
}) => {
  const [is2DView, setIs2DView] = useState(false);
  const [space, setSpace] = useState<SpaceDetails>(plan.space);
  const [budget, setBudget] = useState<BudgetRange>(plan.budget);
  const [theme, setTheme] = useState<DesignTheme>(plan.theme.id as DesignTheme);

  // Collapsible state for the bottom featured assets panel (User Request)
  const [isAssetsPanelOpen, setIsAssetsPanelOpen] = useState(true);

  // Collapsible state for the left parameters HUD
  const [isLeftHudOpen, setIsLeftHudOpen] = useState(true);

  const productList: KohlerProduct[] = [
    plan.products.toilet,
    plan.products.vanity,
    plan.products.faucet,
    plan.products.mirror,
    plan.products.tile,
    plan.products.shower,
    ...(plan.products.bathtub ? [plan.products.bathtub] : []),
    ...plan.products.accessories
  ];

  const handleApplyChanges = () => {
    onUpdatePlanParams(space, budget, theme);
  };

  return (
    <div className="relative w-full h-screen bg-[#0c0d0e] text-white select-none overflow-hidden font-sans">
      {/* 1. Main 3D Three.js Viewport (Dominates the screen) */}
      <div className="absolute inset-0 z-0">
        <BathroomViewer3D
          plan={plan}
          is2DView={is2DView}
          onSelectProduct={onSelectProductForReplacement}
        />
      </div>

      {/* 2. Top Luxury Navigation Bar (Matching Reference Image 2) */}
      <header className="absolute top-0 inset-x-0 z-20 h-16 px-6 flex items-center justify-between pointer-events-auto bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <span className="font-serif-luxury text-xl font-bold tracking-widest text-white uppercase">
              KOHLER
            </span>
            <span className="text-[10px] tracking-widest uppercase text-white/50 border-l border-white/20 pl-3">
              AI BATHROOM DESIGNER
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-xs text-white/70">
            <button className="text-white border-b-2 border-white pb-1 font-medium">Design Studio</button>
            <button onClick={onBackToOverview} className="hover:text-white transition">Product Specs</button>
            <button className="hover:text-white transition">Inspiration</button>
            <button className="hover:text-white transition">About</button>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <span className="hidden lg:block text-[11px] tracking-widest uppercase text-white/40 font-serif-luxury">
            A HIGHER STANDARD OF LIVING
          </span>
          <button
            onClick={onBackToOverview}
            className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs backdrop-blur-md transition flex items-center space-x-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Specifications</span>
          </button>
        </div>
      </header>

      {/* 3. Floating Left HUD: Space, Budget & Theme Customizer (Collapsible) */}
      <div className="absolute top-20 left-6 z-20 w-80 max-w-[calc(100vw-3rem)] pointer-events-auto transition-all duration-300">
        <div className="dark-glass-panel rounded-2xl p-4 shadow-2xl space-y-4 max-h-[calc(100vh-14rem)] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-white">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#c89d6c]" />
              <span>Design Controls</span>
            </div>
            <button
              onClick={() => setIsLeftHudOpen(prev => !prev)}
              className="text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/10 text-xs flex items-center space-x-1"
            >
              <span>{isLeftHudOpen ? 'Collapse' : 'Expand'}</span>
              {isLeftHudOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {isLeftHudOpen && (
            <div className="space-y-4 pt-1">
              {/* Step 1: Space Details */}
              <div>
                <div className="flex items-center space-x-2 text-white/90 text-xs font-semibold uppercase tracking-wider mb-2.5">
                  <span className="w-4 h-4 rounded-full border border-white/40 flex items-center justify-center text-[9px]">1</span>
                  <span>Space Details</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Length</span>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        step="0.1"
                        value={space.length}
                        onChange={(e) => setSpace(s => ({ ...s, length: parseFloat(e.target.value) || 2.5 }))}
                        className="w-16 bg-white/5 border border-white/15 rounded-lg px-2 py-1 text-right text-white font-mono focus:outline-none focus:border-white"
                      />
                      <span className="text-white/40 font-mono text-[10px]">{space.unit}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Width</span>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        step="0.1"
                        value={space.width}
                        onChange={(e) => setSpace(s => ({ ...s, width: parseFloat(e.target.value) || 2.0 }))}
                        className="w-16 bg-white/5 border border-white/15 rounded-lg px-2 py-1 text-right text-white font-mono focus:outline-none focus:border-white"
                      />
                      <span className="text-white/40 font-mono text-[10px]">{space.unit}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Height</span>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        step="0.1"
                        value={space.height}
                        onChange={(e) => setSpace(s => ({ ...s, height: parseFloat(e.target.value) || 2.5 }))}
                        className="w-16 bg-white/5 border border-white/15 rounded-lg px-2 py-1 text-right text-white font-mono focus:outline-none focus:border-white"
                      />
                      <span className="text-white/40 font-mono text-[10px]">{space.unit}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Budget */}
              <div className="pt-3 border-t border-white/10">
                <div className="flex items-center space-x-2 text-white/90 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span className="w-4 h-4 rounded-full border border-white/40 flex items-center justify-center text-[9px]">2</span>
                  <span>Budget</span>
                </div>
                <select
                  value={budget.id}
                  onChange={(e) => {
                    const b = BUDGET_TIERS.find(tier => tier.id === e.target.value);
                    if (b) setBudget(b);
                  }}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white cursor-pointer"
                >
                  {BUDGET_TIERS.map(b => (
                    <option key={b.id} value={b.id} className="bg-[#1c1d20] text-white">{b.label}</option>
                  ))}
                </select>
              </div>

              {/* Step 3: Design Theme Selector */}
              <div className="pt-3 border-t border-white/10">
                <div className="flex items-center space-x-2 text-white/90 text-xs font-semibold uppercase tracking-wider mb-2.5">
                  <span className="w-4 h-4 rounded-full border border-white/40 flex items-center justify-center text-[9px]">3</span>
                  <span>Design Theme</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(KOHLER_THEMES).map((t) => {
                    const isSelected = theme === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setTheme(t.id as DesignTheme)}
                        className={`cursor-pointer rounded-xl overflow-hidden border p-1 transition-all ${
                          isSelected
                            ? 'border-white bg-white/10 ring-1 ring-white'
                            : 'border-white/10 hover:border-white/30 bg-black/30'
                        }`}
                      >
                        <SafeImage
                          src={t.previewImage}
                          alt={t.name}
                          fallbackText={t.name}
                          className="w-full h-12 object-cover rounded-lg"
                        />
                        <p className="text-[10px] font-medium text-white/90 mt-1 truncate px-1">{t.name}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Re-generate CTA */}
              <button
                onClick={handleApplyChanges}
                className="w-full py-2.5 px-4 bg-white text-black hover:bg-neutral-200 font-semibold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2 active:scale-95"
              >
                <span>Generate Design</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <div className="text-[10px] text-white/40 flex items-center justify-center space-x-1 pt-1">
                <Sparkles className="w-3 h-3 text-[#c89d6c]" />
                <span>Real KOHLER catalogue • Guaranteed fit</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Right Side Toolbar (3D / 2D Plan Toggle & Camera) */}
      <div className="absolute top-20 right-6 z-20 flex flex-col space-y-2 pointer-events-auto">
        <button
          onClick={() => setIs2DView(v => !v)}
          className={`p-3 rounded-2xl border backdrop-blur-md transition-all shadow-xl ${
            is2DView
              ? 'bg-white text-black border-white'
              : 'dark-glass-card text-white hover:bg-white/20'
          }`}
          title="Toggle 2D Floor Plan vs 3D View"
        >
          {is2DView ? <Box className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
        </button>

        <div className="dark-glass-card p-2 rounded-2xl flex flex-col space-y-2">
          <button
            onClick={() => setIs2DView(false)}
            className="p-2 text-white/60 hover:text-white rounded-xl hover:bg-white/10 transition"
            title="Reset Perspective"
          >
            <Compass className="w-4 h-4" />
          </button>
          <button
            onClick={() => alert(`Tile: ${plan.products.tile.name}\nFinish: ${plan.products.tile.finish}`)}
            className="p-2 text-white/60 hover:text-white rounded-xl hover:bg-white/10 transition"
            title="Inspect Surface Material"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5. Center Bottom 3D / 2D Pill (Exact layout as Reference Image 2) */}
      <div className={`absolute ${isAssetsPanelOpen ? 'bottom-40' : 'bottom-12'} left-1/2 -translate-x-1/2 z-20 pointer-events-auto transition-all duration-300`}>
        <div className="bg-black/80 backdrop-blur-md border border-white/15 p-1 rounded-full flex items-center space-x-1 shadow-2xl">
          <button
            onClick={() => setIs2DView(false)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center space-x-1.5 transition ${
              !is2DView ? 'bg-white text-black shadow' : 'text-white/60 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D View</span>
          </button>
          <button
            onClick={() => setIs2DView(true)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center space-x-1.5 transition ${
              is2DView ? 'bg-white text-black shadow' : 'text-white/60 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2D Plan</span>
          </button>
        </div>
      </div>

      {/* 6. Floating Bottom Dock: "Featured Products in This Design" (Collapsible on Request) */}
      <div className="absolute bottom-4 inset-x-6 z-20 pointer-events-auto transition-all duration-300">
        {/* Header Bar with Collapse/Expand Toggle Button */}
        <div className="flex items-center justify-between mb-2 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-white">
              Featured Products in This Design
            </span>
            <span className="hidden sm:inline text-[10px] text-white/40">
              ({productList.length} assets • Click fixture to replace)
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-xs font-bold text-[#c89d6c]">
              Total: ${plan.totalCost.toLocaleString()}
            </span>
            <button
              onClick={() => setIsAssetsPanelOpen(prev => !prev)}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition flex items-center space-x-1"
            >
              <span>{isAssetsPanelOpen ? 'Hide Assets' : 'Show Assets'}</span>
              {isAssetsPanelOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Carousel of Used Assets (Conditionally Visible) */}
        {isAssetsPanelOpen && (
          <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-none animate-fade-in">
            {productList.map((prod) => (
              <div
                key={prod.id}
                onClick={() => onSelectProductForReplacement(prod)}
                className="dark-glass-card hover:border-white/40 cursor-pointer rounded-2xl p-3 flex-shrink-0 w-48 transition-all group relative shadow-lg"
              >
                <div className="w-full h-20 bg-white rounded-xl p-1.5 mb-2 flex items-center justify-center overflow-hidden border border-neutral-100">
                  <KohlerProductImage
                    src={prod.image}
                    alt={prod.name}
                    sku={prod.sku}
                    category={prod.category}
                    className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <span className="text-[10px] text-white/40 font-mono uppercase block truncate">
                  {prod.sku}
                </span>
                <h4 className="text-xs font-medium text-white truncate group-hover:text-[#c89d6c] transition-colors">
                  {prod.name}
                </h4>
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/5">
                  <span className="text-xs font-bold text-white/90">
                    ${prod.price.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-white/50 group-hover:text-white flex items-center space-x-0.5">
                    <span>Replace</span>
                    <RefreshCw className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
