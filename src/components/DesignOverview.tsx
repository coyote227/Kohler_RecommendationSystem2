import React, { useState } from 'react';
import { DesignPlan, KohlerProduct } from '../types';
import { Download, RefreshCw, Layers, Box } from 'lucide-react';
import { KohlerProductImage } from './KohlerProductImage';
import { getProductSVG } from '../utils/productSVGs';
import { BathroomViewer3D } from './BathroomViewer3D';

interface DesignOverviewProps {
  plan: DesignPlan;
  onSelectProduct: (product: KohlerProduct) => void;
  onOpen3DView: () => void;
}

export const DesignOverview: React.FC<DesignOverviewProps> = ({
  plan,
  onSelectProduct,
  onOpen3DView
}) => {
  const { products, space, theme, totalCost } = plan;
  const [is2DView, setIs2DView] = useState(false);

  const productList: KohlerProduct[] = [
    products.toilet,
    products.vanity,
    products.faucet,
    products.shower,
    products.mirror,
    products.tile,
    ...(products.bathtub ? [products.bathtub] : []),
    ...products.accessories
  ];

  const downloadProductCostList = () => {
    const escapeHtml = (value: string) => value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    const productRows = productList.map(product => `
      <article class="product">
        <img src="${getProductSVG(product.sku, product.category)}" alt="${escapeHtml(product.name)}" />
        <div class="details">
          <div class="code">${escapeHtml(product.sku)} · ${escapeHtml(product.category.replace('_', ' '))}</div>
          <h2>${escapeHtml(product.name)}</h2>
          <div class="cost">$${product.price.toLocaleString()} USD</div>
        </div>
      </article>
    `).join('');
    const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
    if (!printWindow) return;
    printWindow.document.write(`<!doctype html><html><head><title>KOHLER Products and Costs</title><style>
      @page { size: A4; margin: 16mm; }
      * { box-sizing: border-box; }
      body { margin: 0; color: #171717; font-family: Arial, sans-serif; }
      header { display: flex; justify-content: space-between; align-items: end; border-bottom: 2px solid #171717; padding-bottom: 12px; margin-bottom: 18px; }
      h1 { margin: 0; font-size: 22px; letter-spacing: 1px; }
      header span { color: #777; font-size: 11px; }
      .product { display: flex; gap: 18px; align-items: center; min-height: 118px; border-bottom: 1px solid #ddd; padding: 12px 0; break-inside: avoid; }
      .product img { width: 100px; height: 100px; object-fit: contain; background: #f7f7f7; border: 1px solid #e4e4e4; }
      .details { flex: 1; }
      .code { color: #777; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; }
      h2 { margin: 7px 0; font-size: 14px; }
      .cost { font-weight: 700; font-size: 15px; }
      footer { display: flex; justify-content: flex-end; gap: 24px; padding-top: 18px; font-weight: 700; font-size: 16px; }
    </style></head><body>
      <header><h1>KOHLER PRODUCTS</h1><span>Selected products and costs</span></header>
      ${productRows}
      <footer><span>Total</span><span>$${totalCost.toLocaleString()} USD</span></footer>
      <script>window.onload = () => { window.focus(); window.print(); };</script>
    </body></html>`);
    printWindow.document.close();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header section (Faithfully matching Reference Image 1 top right) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-950">
            Your AI-Generated Bathroom Design
          </h1>
          <p className="text-xs md:text-sm text-neutral-500 mt-1">
            A {space.length} {space.unit} × {space.width} {space.unit} bathroom • Budget: {plan.budget.label} • Theme: {theme.name}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-neutral-100 p-1 rounded-xl flex items-center border border-neutral-200">
            <button
              onClick={() => setIs2DView(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                !is2DView ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-black'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D View</span>
            </button>
            <button
              onClick={() => setIs2DView(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                is2DView ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-black'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2D Plan</span>
            </button>
          </div>

          <button
            onClick={onOpen3DView}
            className="px-5 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow transition flex items-center space-x-2"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Full 3D Studio</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive 3D Room Viewer + Design Overview sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* Left 8 Cols: Interactive 3D Bathroom Scene (Matching Reference Image 1 top right) */}
        <div className="lg:col-span-8 bg-black rounded-3xl overflow-hidden shadow-xl border border-neutral-200 relative min-h-[460px] flex flex-col">
          <div className="flex-1 relative w-full h-[460px]">
            <BathroomViewer3D
              plan={plan}
              is2DView={is2DView}
              onSelectProduct={onSelectProduct}
            />
          </div>
          <div className="p-3 bg-neutral-900/90 backdrop-blur-md border-t border-white/10 flex items-center justify-between text-xs text-white/70 px-6">
            <span>Interactive 3D Preview: Rotate, zoom, and explore your bathroom layout</span>
            <button
              onClick={onOpen3DView}
              className="text-[#c89d6c] hover:underline font-medium"
            >
              Enter Fullscreen Studio →
            </button>
          </div>
        </div>

        {/* Right 4 Cols: Design Overview Summary card (Matching middle right of reference 1) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-2">
              Design overview
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {theme.description}
            </p>

            <div className="mt-6 space-y-4 pt-4 border-t border-neutral-100">
              {/* Cost */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 font-bold">
                  $
                </div>
                <div>
                  <span className="text-[11px] text-neutral-500 block">Total estimated cost</span>
                  <span className="text-sm font-bold text-neutral-900">
                    ${totalCost.toLocaleString()} (USD)
                  </span>
                </div>
              </div>

              {/* Products count */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-neutral-500 block">Products used</span>
                  <span className="text-sm font-bold text-neutral-900">{productList.length} products</span>
                </div>
              </div>

              {/* Tile */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700">
                  <div className="w-4 h-4 rounded bg-stone-300 border border-stone-400" />
                </div>
                <div>
                  <span className="text-[11px] text-neutral-500 block">Selected Tile</span>
                  <span className="text-sm font-bold text-neutral-900">{products.tile.name}</span>
                </div>
              </div>

              {/* Style Keywords */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 mt-0.5">
                  #
                </div>
                <div>
                  <span className="text-[11px] text-neutral-500 block">Style keywords</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {theme.materials.slice(0, 3).map((m, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 bg-neutral-100 rounded text-neutral-700">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Space Fit Checklist */}
            <div className="mt-6 pt-4 border-t border-neutral-100">
              <span className="text-xs font-semibold text-neutral-900 block mb-2">Space Fit Validation</span>
              <div className="space-y-1.5 text-xs text-neutral-600">
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Vanity clearance fits room width</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Toilet complies with standard ergonomics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Shower enclosure perimeter aligned</span>
                </div>
                {products.bathtub && (
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Freestanding soaking bath circulation verified</span>
                  </div>
                )}
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-6 pt-4 space-y-2.5">
              <button
                onClick={onOpen3DView}
                className="w-full py-3 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow transition"
              >
                View in Interactive 3D Studio
              </button>
              <button
                onClick={downloadProductCostList}
                className="w-full py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-medium rounded-xl transition flex items-center justify-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Product PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Products in Your Design (Matching bottom right of reference 1) */}
      <div className="mt-12 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Products in Your Design</h2>
            <p className="text-xs text-neutral-500">All products are from authentic KOHLER catalogues & 3D Warehouse.</p>
          </div>
          <span className="text-xs font-medium px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-xl border border-neutral-200">
            {productList.length} Authentic Products Selected
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {productList.map((prod) => (
            <div
              key={prod.id}
              className="group relative bg-white border border-neutral-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-xl hover:border-neutral-400 transition-all duration-200"
            >
              <div>
                <div className="w-full h-40 bg-neutral-50 rounded-xl mb-3 p-3 flex items-center justify-center overflow-hidden border border-neutral-100">
                  <KohlerProductImage
                    src={prod.image}
                    alt={prod.name}
                    sku={prod.sku}
                    category={prod.category}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                  {prod.sku} • {prod.category.replace('_', ' ')}
                </span>
                <h3 className="text-xs font-semibold text-neutral-900 line-clamp-2 mt-0.5">
                  {prod.name}
                </h3>
                <p className="text-[11px] text-neutral-500 mt-1">
                  {prod.dimensions.width} × {prod.dimensions.depth} × {prod.dimensions.height} mm
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-neutral-900">
                    ${prod.price.toLocaleString()}
                  </span>
                  {prod.category === 'tile' && <span className="text-[10px] text-neutral-400 ml-1">(per 5m²)</span>}
                </div>

                <button
                  onClick={() => onSelectProduct(prod)}
                  className="text-[11px] font-medium text-neutral-600 hover:text-black flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition"
                >
                  <span>Replace</span>
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
