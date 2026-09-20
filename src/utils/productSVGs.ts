/**
 * Returns a high-resolution crisp SVG vector graphic for each authentic KOHLER product.
 * These guarantee 100% reliable image display without external 403 HTTP blockages or broken images.
 */
export function getProductSVG(sku: string, category: string): string {
  // SVG definitions with crisp line work, subtle gradients, and luxury aesthetic
  if (sku === 'K-5401' || sku === 'K-3900' || sku === 'K-4007' || sku === 'K-3810' || sku === 'K-3983' || category.includes('toilet')) {
    const isVeil = sku === 'K-5401';
    const isNumi = sku === 'K-3900';
    return `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
        <defs>
          <linearGradient id="porc" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="70%" stop-color="#f0f2f5"/>
            <stop offset="100%" stop-color="#d9dee3"/>
          </linearGradient>
          <linearGradient id="seat" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#fdfdfd"/>
            <stop offset="100%" stop-color="#e2e6eb"/>
          </linearGradient>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#80ed99" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#80ed99" stop-opacity="0"/>
          </radialGradient>
          <filter id="drop" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.12"/>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="#fcfcfd"/>
        <ellipse cx="200" cy="330" rx="120" ry="24" fill="#000000" opacity="0.06"/>
        <g filter="url(#drop)">
          <!-- Skirted Base -->
          <path d="M120,230 C120,310 140,335 200,335 C260,335 280,310 280,230 L275,180 C275,150 260,140 200,140 C140,140 125,150 125,180 Z" fill="url(#porc)" stroke="#d0d5dd" stroke-width="1.5"/>
          <!-- Seat Ring -->
          <ellipse cx="200" cy="180" rx="72" ry="52" fill="url(#seat)" stroke="#cfd4dc" stroke-width="1.5"/>
          <!-- Inner Bowl -->
          <ellipse cx="200" cy="185" rx="50" ry="34" fill="#e9edf2" stroke="#d5dbe2" stroke-width="1"/>
          <!-- Lid / Back Unit -->
          <path d="M140,165 C140,120 160,105 200,105 C240,105 260,120 260,165 C260,175 240,185 200,185 C160,185 140,175 140,165 Z" fill="#ffffff" stroke="#caced4" stroke-width="1.5"/>
          ${isVeil ? `
            <!-- Veil Nightlight accent -->
            <path d="M165,155 Q200,165 235,155" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.85"/>
          ` : ''}
          ${isNumi ? `
            <!-- Numi angular lid detailing -->
            <rect x="155" y="115" width="90" height="40" rx="6" fill="#18181b" stroke="#3f3f46" stroke-width="1"/>
            <circle cx="200" cy="135" r="4" fill="#60a5fa"/>
          ` : ''}
        </g>
        <text x="200" y="375" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="#94a3b8" letter-spacing="1">KOHLER VEIL® SERIES</text>
      </svg>
    `)}`;
  }

  if (sku.includes('VANITY') || sku.startsWith('K-995') || sku === 'K-2833' || category === 'vanity') {
    const isWood = sku === 'K-99573';
    return `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
        <defs>
          <linearGradient id="wood" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#b88d57"/>
            <stop offset="50%" stop-color="#cf9f65"/>
            <stop offset="100%" stop-color="#b48751"/>
          </linearGradient>
          <linearGradient id="top" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#eceff1"/>
          </linearGradient>
          <filter id="dropV" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#000000" flood-opacity="0.14"/>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="#fcfcfd"/>
        <ellipse cx="200" cy="335" rx="140" ry="16" fill="#000000" opacity="0.05"/>
        <g filter="url(#dropV)">
          <!-- Floating Cabinet Body -->
          <rect x="70" y="170" width="260" height="120" rx="8" fill="${isWood ? 'url(#wood)' : '#27272a'}" stroke="${isWood ? '#996f3d' : '#18181b'}" stroke-width="1.5"/>
          <!-- Drawer divider horizontal seam -->
          <line x1="72" y1="230" x2="328" y2="230" stroke="#000000" stroke-width="1.5" opacity="0.3"/>
          <!-- Integrated handles -->
          <rect x="160" y="195" width="80" height="6" rx="3" fill="#000000" opacity="0.2"/>
          <rect x="160" y="255" width="80" height="6" rx="3" fill="#000000" opacity="0.2"/>
          <!-- Countertop Slab -->
          <rect x="65" y="155" width="270" height="16" rx="4" fill="url(#top)" stroke="#cfd8dc" stroke-width="1.5"/>
          <!-- Vessel Basin -->
          <ellipse cx="200" cy="148" rx="55" ry="22" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
          <ellipse cx="200" cy="150" rx="38" ry="14" fill="#f1f5f9"/>
          <!-- Faucet Spout -->
          <path d="M200,140 L200,105 Q200,95 210,95 L220,95" fill="none" stroke="#1e293b" stroke-width="5" stroke-linecap="round"/>
        </g>
        <text x="200" y="375" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="#94a3b8" letter-spacing="1">KOHLER WALL-MOUNT VANITY</text>
      </svg>
    `)}`;
  }

  if (sku.includes('FAUCET') || sku.startsWith('K-234') || sku.startsWith('K-144') || sku.startsWith('K-727') || sku.startsWith('K-730') || category === 'faucet') {
    const isGold = sku.includes('144') || sku.includes('727');
    const color = isGold ? '#d4af37' : '#1e293b';
    return `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
        <defs>
          <linearGradient id="metalF" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="${isGold ? '#e5c05a' : '#334155'}"/>
            <stop offset="50%" stop-color="${isGold ? '#fff1b0' : '#64748b'}"/>
            <stop offset="100%" stop-color="${isGold ? '#b38f28' : '#1e293b'}"/>
          </linearGradient>
          <filter id="dropF" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#000000" flood-opacity="0.12"/>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="#fcfcfd"/>
        <ellipse cx="200" cy="315" rx="80" ry="12" fill="#000000" opacity="0.06"/>
        <g filter="url(#dropF)">
          <!-- Base Escutcheon -->
          <cylinder />
          <ellipse cx="200" cy="300" rx="42" ry="14" fill="url(#metalF)" stroke="${color}" stroke-width="1.5"/>
          <!-- Vertical Spout Column -->
          <path d="M188,300 L188,140 Q188,105 215,105 L245,105 L245,130 L230,130 Q212,130 212,148 L212,300 Z" fill="url(#metalF)" stroke="${color}" stroke-width="1.5"/>
          <!-- Aerator Spout Tip -->
          <ellipse cx="237" cy="130" rx="8" ry="4" fill="#e2e8f0"/>
          <!-- Minimal Joystick Handle -->
          <rect x="155" y="170" width="10" height="40" rx="4" transform="rotate(-30 155 170)" fill="url(#metalF)" stroke="${color}" stroke-width="1.5"/>
        </g>
        <text x="200" y="375" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="#94a3b8" letter-spacing="1">KOHLER PARALLEL® FAUCET</text>
      </svg>
    `)}`;
  }

  if (sku.includes('SHOWER') || sku.startsWith('K-987') || sku.startsWith('K-263') || sku.startsWith('K-706') || category === 'shower') {
    return `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
        <defs>
          <linearGradient id="chromeSh" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#1e293b"/>
            <stop offset="60%" stop-color="#475569"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
          <filter id="dropS" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#000000" flood-opacity="0.14"/>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="#fcfcfd"/>
        <g filter="url(#dropS)">
          <!-- Glass Enclosure Silhouette -->
          <rect x="100" y="60" width="180" height="270" rx="4" fill="#e0f2fe" opacity="0.3" stroke="#93c5fd" stroke-width="1.5"/>
          <!-- Shower Pipe Column -->
          <path d="M190,300 L190,110 Q190,80 220,80 L250,80" fill="none" stroke="url(#chromeSh)" stroke-width="6" stroke-linecap="round"/>
          <!-- Statement Katalyst 10" Round Rainhead -->
          <ellipse cx="250" cy="92" rx="42" ry="12" fill="url(#chromeSh)" stroke="#0f172a" stroke-width="1.5"/>
          <!-- Water Spray Droplets -->
          <g stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="2 6" opacity="0.7">
            <line x1="225" y1="105" x2="225" y2="230"/>
            <line x1="240" y1="105" x2="240" y2="245"/>
            <line x1="250" y1="105" x2="250" y2="250"/>
            <line x1="260" y1="105" x2="260" y2="245"/>
            <line x1="275" y1="105" x2="275" y2="230"/>
          </g>
          <!-- Handshower dock -->
          <rect x="180" y="190" width="8" height="50" rx="3" fill="#1e293b"/>
        </g>
        <text x="200" y="375" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="#94a3b8" letter-spacing="1">KOHLER STATEMENT™ RAINHEAD</text>
      </svg>
    `)}`;
  }

  if (sku.includes('MIRROR') || sku.startsWith('K-782') || sku.startsWith('K-995') || sku.startsWith('K-263') || category === 'mirror') {
    return `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
        <defs>
          <radialGradient id="mirrorGlow" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stop-color="#fffbeb" stop-opacity="0"/>
            <stop offset="95%" stop-color="#fef3c7" stop-opacity="0.9"/>
            <stop offset="100%" stop-color="#fde68a" stop-opacity="1"/>
          </radialGradient>
          <linearGradient id="glassReflect" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="45%" stop-color="#f8fafc"/>
            <stop offset="55%" stop-color="#e2e8f0"/>
            <stop offset="100%" stop-color="#cbd5e1"/>
          </linearGradient>
          <filter id="haloFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="12" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="#fcfcfd"/>
        <!-- Amber Backlit Halo Aura -->
        <circle cx="200" cy="190" r="125" fill="#fde68a" opacity="0.35" filter="url(#haloFilter)"/>
        <!-- Mirror Glass Disc -->
        <circle cx="200" cy="190" r="105" fill="url(#glassReflect)" stroke="#e2e8f0" stroke-width="2"/>
        <!-- Halo Rim Light -->
        <circle cx="200" cy="190" r="105" fill="none" stroke="#fef08a" stroke-width="4" opacity="0.9"/>
        <!-- Glass diagonal sheen -->
        <path d="M125,145 Q200,80 275,145" fill="none" stroke="#ffffff" stroke-width="6" opacity="0.6"/>
        <text x="200" y="375" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="#94a3b8" letter-spacing="1">KOHLER ILLUMINATE® MIRROR</text>
      </svg>
    `)}`;
  }

  if (sku.includes('TILE') || category === 'tile') {
    const isMarble = sku.includes('205');
    const isConcrete = sku.includes('310');
    return `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
        <defs>
          <linearGradient id="tileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${isMarble ? '#ffffff' : (isConcrete ? '#64748b' : '#c4b5a5')}"/>
            <stop offset="100%" stop-color="${isMarble ? '#f1f5f9' : (isConcrete ? '#475569' : '#a89887')}"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="#fcfcfd"/>
        <g transform="translate(60, 60)">
          <!-- Tile slab -->
          <rect x="0" y="0" width="280" height="260" rx="8" fill="url(#tileGrad)" stroke="#94a3b8" stroke-width="1.5"/>
          <!-- Grout lines -->
          <line x1="140" y1="0" x2="140" y2="260" stroke="#786f66" stroke-width="2" opacity="0.4"/>
          <line x1="0" y1="130" x2="280" y2="130" stroke="#786f66" stroke-width="2" opacity="0.4"/>
          ${isMarble ? `
            <path d="M20,40 Q80,120 180,110 T260,220" fill="none" stroke="#94a3b8" stroke-width="2" opacity="0.5"/>
            <path d="M120,20 Q160,80 140,160" fill="none" stroke="#cbd5e1" stroke-width="1.5" opacity="0.6"/>
          ` : `
            <!-- Stone texture stipples -->
            <circle cx="50" cy="50" r="1.5" fill="#524a42" opacity="0.3"/>
            <circle cx="110" cy="80" r="1.5" fill="#524a42" opacity="0.3"/>
            <circle cx="210" cy="60" r="2" fill="#524a42" opacity="0.3"/>
            <circle cx="70" cy="200" r="1.5" fill="#524a42" opacity="0.3"/>
            <circle cx="230" cy="210" r="2" fill="#524a42" opacity="0.3"/>
          `}
        </g>
        <text x="200" y="375" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="#94a3b8" letter-spacing="1">KOHLER ARCHITECTURAL TILE</text>
      </svg>
    `)}`;
  }

  // Bathtub / generic
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#fcfcfd"/>
      <ellipse cx="200" cy="310" rx="140" ry="18" fill="#000000" opacity="0.06"/>
      <!-- Freestanding Tub Body -->
      <ellipse cx="200" cy="220" rx="130" ry="60" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <ellipse cx="200" cy="216" rx="105" ry="42" fill="#e0f2fe" opacity="0.6" stroke="#93c5fd" stroke-width="1"/>
      <text x="200" y="375" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="#94a3b8" letter-spacing="1">KOHLER CIEL® SOAKING BATH</text>
    </svg>
  `)}`;
}
