import React, { useState } from 'react';
import { SpaceDetails, DesignTheme, BudgetRange, DesignPlan, KohlerProduct } from './types';
import { BUDGET_TIERS, KOHLER_THEMES } from './data/kohlerCatalogue';
import { optimizeBathroomDesign } from './services/optimizer';
import { GeneratorForm } from './components/GeneratorForm';
import { DesignOverview } from './components/DesignOverview';
import { DarkRoomConfigurator } from './components/DarkRoomConfigurator';
import { ProductReplacementModal } from './components/ProductReplacementModal';
import { Sparkles, ShieldCheck, Box, Compass, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export function App() {
  // Navigation & View State
  // 'landing' | 'overview' | 'configurator3d'
  const [currentView, setCurrentView] = useState<'landing' | 'overview' | 'configurator3d'>('landing');

  // User input states (pre-populated with realistic Japanese Zen specs matching reference)
  const [space, setSpace] = useState<SpaceDetails>({
    length: 3.0,
    width: 2.0,
    height: 2.5,
    unit: 'm'
  });
  const [budget, setBudget] = useState<BudgetRange>(BUDGET_TIERS[1]); // $5,000 – $10,000
  const [theme, setTheme] = useState<DesignTheme>('japanese_zen');

  // Generated Plan State
  const [designPlan, setDesignPlan] = useState<DesignPlan>(() => {
    return optimizeBathroomDesign({
      space: { length: 3.0, width: 2.0, height: 2.5, unit: 'm' },
      budget: BUDGET_TIERS[1],
      theme: 'japanese_zen'
    });
  });

  // Modal State for Product Customization / Replacement
  const [replacingProduct, setReplacingProduct] = useState<KohlerProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Generate Handler
  const handleGenerate = () => {
    const newPlan = optimizeBathroomDesign({
      space,
      budget,
      theme
    });
    setDesignPlan(newPlan);
    setCurrentView('configurator3d');

    // Subtle celebration feedback
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  // Update Plan parameters in 3D Configurator
  const handleUpdatePlanParams = (newSpace: SpaceDetails, newBudget: BudgetRange, newTheme: DesignTheme) => {
    setSpace(newSpace);
    setBudget(newBudget);
    setTheme(newTheme);

    const updated = optimizeBathroomDesign({
      space: newSpace,
      budget: newBudget,
      theme: newTheme
    });
    setDesignPlan(updated);
  };

  // Individual Product Replacement
  const handleSelectReplacement = (newProduct: KohlerProduct) => {
    if (!replacingProduct) return;

    setDesignPlan(prev => {
      const updatedProducts = { ...prev.products };

      if (newProduct.category === 'toilet' || newProduct.category === 'smart_toilet') {
        updatedProducts.toilet = newProduct;
      } else if (newProduct.category === 'vanity') {
        updatedProducts.vanity = newProduct;
      } else if (newProduct.category === 'faucet') {
        updatedProducts.faucet = newProduct;
      } else if (newProduct.category === 'shower') {
        updatedProducts.shower = newProduct;
      } else if (newProduct.category === 'bathtub') {
        updatedProducts.bathtub = newProduct;
      } else if (newProduct.category === 'mirror') {
        updatedProducts.mirror = newProduct;
      } else if (newProduct.category === 'tile') {
        updatedProducts.tile = newProduct;
      }

      // Recalculate total cost
      let total = updatedProducts.toilet.price +
        updatedProducts.vanity.price +
        updatedProducts.faucet.price +
        updatedProducts.shower.price +
        updatedProducts.mirror.price +
        updatedProducts.tile.price;
      if (updatedProducts.bathtub) total += updatedProducts.bathtub.price;
      updatedProducts.accessories.forEach(a => total += a.price);

      return {
        ...prev,
        products: updatedProducts,
        totalCost: total,
        remainingBudget: Math.max(0, prev.budget.max - total)
      };
    });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-neutral-800 selection:text-white">
      {/* If 3D Configurator is active, it fills full screen */}
      {currentView === 'configurator3d' ? (
        <DarkRoomConfigurator
          plan={designPlan}
          onUpdatePlanParams={handleUpdatePlanParams}
          onSelectProductForReplacement={(prod) => {
            setReplacingProduct(prod);
            setIsModalOpen(true);
          }}
          onBackToOverview={() => setCurrentView('overview')}
        />
      ) : (
        <div className="flex-1 flex flex-col bg-[#f7f7f8]">
          {/* Top Brand Header (Matching Reference Image 1) */}
          <header className="w-full bg-white border-b border-neutral-200 sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <button
                  onClick={() => setCurrentView('landing')}
                  className="font-serif-luxury text-2xl font-black tracking-widest text-black uppercase"
                >
                  KOHLER
                </button>
                <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-neutral-600">
                  <button
                    onClick={() => setCurrentView('landing')}
                    className={`pb-1 ${currentView === 'landing' ? 'text-black border-b-2 border-black' : 'hover:text-black'}`}
                  >
                    AI Bathroom Designer
                  </button>
                  <button
                    onClick={() => setCurrentView('overview')}
                    className={`pb-1 ${currentView === 'overview' ? 'text-black border-b-2 border-black' : 'hover:text-black'}`}
                  >
                    Specification & Products
                  </button>
                  <span className="text-neutral-400 hover:text-black cursor-pointer">Inspiration</span>
                  <span className="text-neutral-400 hover:text-black cursor-pointer">About</span>
                </nav>
              </div>

              <div className="flex items-center space-x-4">
                {currentView === 'overview' && (
                  <button
                    onClick={() => setCurrentView('configurator3d')}
                    className="px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow transition flex items-center space-x-1.5"
                  >
                    <Box className="w-4 h-4" />
                    <span>Open 3D Room</span>
                  </button>
                )}
                {currentView === 'landing' && (
                  <button
                    onClick={() => {
                      const newPlan = optimizeBathroomDesign({ space, budget, theme });
                      setDesignPlan(newPlan);
                      setCurrentView('configurator3d');
                    }}
                    className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-medium rounded-xl transition"
                  >
                    Quick Launch 3D
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* Main Body */}
          {currentView === 'landing' ? (
            <main className="flex-1">
              {/* Hero Banner with Form Card Overlay (Exact Match of Reference Image 1 Left Side) */}
              <div className="relative min-h-[calc(100vh-5rem)] flex items-center">
                {/* Hero Background Image with Subtle Kohler Luxury Bathroom */}
                <div className="absolute inset-0 z-0">
                  <img
                    src="https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=2000&q=85"
                    alt="KOHLER Luxury Bathroom"
                    className="w-full h-full object-cover object-center brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  {/* Left Column: Hero Title & Badges */}
                  <div className="lg:col-span-6 text-white space-y-6">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-sans leading-[1.1]">
                      KOHLER AI <br />
                      <span className="text-neutral-200 font-light">Bathroom Designer</span> <br />
                      & Planner
                    </h1>
                    <p className="text-lg text-neutral-300 font-light max-w-lg leading-relaxed">
                      Your space. Our expertise. A bathroom that fits your life.
                    </p>

                    {/* Value Badges */}
                    <div className="grid grid-cols-2 gap-4 pt-4 max-w-md">
                      <div className="flex items-center space-x-3 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                        <Sparkles className="w-5 h-5 text-[#c89d6c]" />
                        <span className="text-xs font-medium text-white/90">AI-powered design</span>
                      </div>
                      <div className="flex items-center space-x-3 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                        <ShieldCheck className="w-5 h-5 text-[#c89d6c]" />
                        <span className="text-xs font-medium text-white/90">Real KOHLER products</span>
                      </div>
                      <div className="flex items-center space-x-3 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                        <Box className="w-5 h-5 text-[#c89d6c]" />
                        <span className="text-xs font-medium text-white/90">3D visualization</span>
                      </div>
                      <div className="flex items-center space-x-3 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                        <Compass className="w-5 h-5 text-[#c89d6c]" />
                        <span className="text-xs font-medium text-white/90">Personalized space</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Interactive Generator Form (Matching Reference Image 1) */}
                  <div className="lg:col-span-6 flex justify-center lg:justify-end">
                    <GeneratorForm
                      space={space}
                      setSpace={setSpace}
                      theme={theme}
                      setTheme={setTheme}
                      budget={budget}
                      setBudget={setBudget}
                      onGenerate={handleGenerate}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Brand Credibility Ribbon */}
              <div className="bg-white border-t border-neutral-200 py-8">
                <div className="max-w-7xl mx-auto px-6 text-center">
                  <p className="text-xs uppercase tracking-widest font-semibold text-neutral-400 mb-6 font-serif-luxury">
                    Trusted design. Iconic products. A more beautiful you.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs text-neutral-600 font-medium">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-[#c89d6c]" />
                      <span>Innovative Design</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-[#c89d6c]" />
                      <span>Exceptional Quality</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-[#c89d6c]" />
                      <span>Sustainable Solutions</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-[#c89d6c]" />
                      <span>Global Trust</span>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          ) : (
            <main className="flex-1">
              <DesignOverview
                plan={designPlan}
                onSelectProduct={(prod) => {
                  setReplacingProduct(prod);
                  setIsModalOpen(true);
                }}
                onOpen3DView={() => setCurrentView('configurator3d')}
              />
            </main>
          )}
        </div>
      )}

      {/* Global Product Customization / Replacement Modal */}
      <ProductReplacementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentProduct={replacingProduct}
        theme={theme}
        budgetMax={budget.max}
        space={space}
        onSelectReplacement={handleSelectReplacement}
      />
    </div>
  );
}
export default App;
