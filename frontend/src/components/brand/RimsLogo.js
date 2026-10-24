/**
 * STOCKORA Brand Identity & Design System
 * "Inventory. Warehouses. Orders."
 * 
 * Features:
 * - Connected hexagonal network with 3 gradient nodes (Blue → Teal → Emerald)
 * - Central isometric 3D fulfillment shipping package
 * - Stylized brand typography: STOCK + ORA (emerald chevron A)
 * - Official raster asset: /stockora-logo.png
 */

export function renderStockoraLogoMark(size = 32, className = "") {
  return `
    <span class="stockora-logo-mark-wrap ${className}" style="display: inline-flex; align-items: center; justify-content: center; width: ${size}px; height: ${size}px; flex-shrink: 0;" title="Stockora">
      <svg 
        class="stockora-vector-mark" 
        width="${size}" 
        height="${size}" 
        viewBox="0 0 64 64" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Stockora Logo Mark"
      >
        <defs>
          <linearGradient id="stockora-hex-grad" x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#1A64F0" />
            <stop offset="50%" stop-color="#00B4D8" />
            <stop offset="100%" stop-color="#00C48C" />
          </linearGradient>
          <linearGradient id="stockora-box-top" x1="22" y1="18" x2="42" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#2D72F6" />
            <stop offset="100%" stop-color="#1A55D6" />
          </linearGradient>
          <linearGradient id="stockora-node-top" x1="28" y1="3" x2="36" y2="11" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#00C48C" />
            <stop offset="100%" stop-color="#009E70" />
          </linearGradient>
        </defs>

        <!-- Outer Hexagonal Frame -->
        <path 
          d="M32 8L49 17.8V37.4L32 47.2L15 37.4V17.8L32 8Z" 
          stroke="url(#stockora-hex-grad)" 
          stroke-width="4.8" 
          stroke-linejoin="round" 
          stroke-linecap="round"
        />

        <!-- Connected Nodes on Vertices -->
        <circle cx="32" cy="8" r="4.8" fill="url(#stockora-node-top)" />
        <circle cx="15" cy="37.4" r="4.8" fill="#1A64F0" />
        <circle cx="49" cy="37.4" r="4.8" fill="#00C48C" />

        <!-- 3D Isometric Package Box -->
        <!-- Box Top Face -->
        <path d="M32 17.5L42 23L32 28.5L22 23L32 17.5Z" fill="url(#stockora-box-top)" />
        <!-- Top Tape Strip -->
        <path d="M30 18.5L34 20.7L34 27.5L30 25.3Z" fill="#FFFFFF" opacity="0.9" />
        
        <!-- Box Left Shadow Face -->
        <path d="M22 24.2V35.5L31 40.5V29.2L22 24.2Z" fill="#0E3CA8" />
        
        <!-- Box Right Lit Face -->
        <path d="M33 29.2V40.5L42 35.5V24.2L33 29.2Z" fill="#1A5FE0" />
        <!-- Right Face Tape Flap -->
        <path d="M36 30.5V37L39 35.5V29L36 30.5Z" fill="#FFFFFF" opacity="0.9" />
      </svg>
    </span>
  `;
}

export function renderStockoraLogo({
  size = 36,
  showText = true,
  subtitle = "Inventory. Warehouses. Orders.",
  href = "#shop",
  className = "",
  useImage = false
} = {}) {
  if (useImage) {
    return `
      <a href="${href}" class="stockora-brand-link ${className}" title="Stockora — Inventory. Warehouses. Orders.">
        <img src="/stockora-icon.png" alt="Stockora Icon" style="height: ${size}px; width: ${size}px; object-fit: contain; border-radius: 6px;" />
      </a>
    `;
  }

  const mark = renderStockoraLogoMark(size);

  if (!showText) {
    return `
      <a href="${href}" class="stockora-brand-link ${className}" title="Stockora — Inventory. Warehouses. Orders.">
        ${mark}
      </a>
    `;
  }

  return `
    <a href="${href}" class="stockora-brand-link ${className}" title="Stockora — Inventory. Warehouses. Orders." style="display: inline-flex; align-items: center; gap: 10px; text-decoration: none;">
      <div class="stockora-logo-mark-wrap">
        ${mark}
      </div>
      <div class="stockora-brand-text">
        <div class="stockora-brand-title" style="font-weight: 900; font-size: ${Math.max(1.1, size * 0.035)}rem; line-height: 1; letter-spacing: -0.02em; color: var(--text-main, #0f172a);">
          <span class="stockora-name-main">STOCK</span><span class="stockora-name-grad" style="background: linear-gradient(135deg, #00b4d8, #00c48c); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">OR</span><span class="stockora-name-chevron" style="background: linear-gradient(135deg, #00b4d8, #00c48c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-family: sans-serif; font-weight: 900;">A</span>
        </div>
        <div class="stockora-brand-subtitle" style="font-size: 0.68rem; font-weight: 600; color: var(--text-muted, #64748b); letter-spacing: 0.03em; margin-top: 2px;">
          ${subtitle}
        </div>
      </div>
    </a>
  `;
}

// Backward compatibility aliases
export const renderRimsLogoMark = renderStockoraLogoMark;
export const renderRimsLogo = renderStockoraLogo;

export function getStockoraFaviconSvgDataUri() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs>
      <linearGradient id="g" x1="10" y1="10" x2="54" y2="54">
        <stop offset="0%" stop-color="#1A64F0"/>
        <stop offset="50%" stop-color="#00B4D8"/>
        <stop offset="100%" stop-color="#00C48C"/>
      </linearGradient>
    </defs>
    <path d="M32 8L49 17.8V37.4L32 47.2L15 37.4V17.8L32 8Z" stroke="url(#g)" stroke-width="5" stroke-linejoin="round" fill="none"/>
    <circle cx="32" cy="8" r="5" fill="#00C48C"/>
    <circle cx="15" cy="37.4" r="5" fill="#1A64F0"/>
    <circle cx="49" cy="37.4" r="5" fill="#00C48C"/>
    <path d="M32 17.5L42 23L32 28.5L22 23L32 17.5Z" fill="#2D72F6"/>
    <path d="M22 24.2V35.5L31 40.5V29.2L22 24.2Z" fill="#0E3CA8"/>
    <path d="M33 29.2V40.5L42 35.5V24.2L33 29.2Z" fill="#1A5FE0"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const getRimsFaviconSvgDataUri = getStockoraFaviconSvgDataUri;
