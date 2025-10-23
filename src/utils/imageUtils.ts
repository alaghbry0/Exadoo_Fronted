/**
 * Image Utilities - أدوات معالجة الصور
 * توفر blur placeholders ديناميكية وتحسينات أخرى
 */

/**
 * إنشاء blur placeholder ديناميكي بناءً على اللون
 */
export function generateBlurDataURL(color: string = "#f5f5f5"): string {
  // تحويل اللون إلى RGB
  const rgb = hexToRgb(color);

  // إنشاء SVG blur placeholder
  const svg = `
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(${rgb.r},${rgb.g},${rgb.b});stop-opacity:0.8" />
          <stop offset="50%" style="stop-color:rgb(${rgb.r + 10},${rgb.g + 10},${rgb.b + 10});stop-opacity:0.6" />
          <stop offset="100%" style="stop-color:rgb(${rgb.r},${rgb.g},${rgb.b});stop-opacity:0.8" />
        </linearGradient>
        <filter id="blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" filter="url(#blur)" />
    </svg>
  `.trim();

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

/**
 * تحويل HEX إلى RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 245, g: 245, b: 245 }; // fallback
}

/**
 * Blur placeholders جاهزة للاستخدام
 */
export const blurPlaceholders = {
  light: generateBlurDataURL("#f5f5f5"),
  dark: generateBlurDataURL("#1a1a1a"),
  primary: generateBlurDataURL("#0084FF"),
  secondary: generateBlurDataURL("#8B5CF6"),
  neutral: generateBlurDataURL("#e5e7eb"),
} as const;

/**
 * إنشاء shimmer effect SVG
 */
export function generateShimmerDataURL(
  baseColor: string = "#f5f5f5",
  shimmerColor: string = "#ffffff",
): string {
  const svg = `
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${baseColor};stop-opacity:1" />
          <stop offset="50%" style="stop-color:${shimmerColor};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${baseColor};stop-opacity:1" />
        </linearGradient>
        <animate
          attributeName="x1"
          values="-100%;100%"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </defs>
      <rect width="100%" height="100%" fill="url(#shimmer)" />
    </svg>
  `.trim();

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

/**
 * حساب aspect ratio من الأبعاد
 */
export function calculateAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}/${height / divisor}`;
}

/**
 * تحسين جودة الصورة بناءً على الحجم
 */
export function getOptimalQuality(width: number): number {
  if (width <= 400) return 75;
  if (width <= 800) return 80;
  if (width <= 1200) return 85;
  return 90;
}

/**
 * تحديد sizes attribute بناءً على breakpoints
 */
export function generateSizesAttribute(sizes?: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
}): string {
  const { mobile = "100vw", tablet = "50vw", desktop = "33vw" } = sizes || {};

  return `(max-width: 640px) ${mobile}, (max-width: 1024px) ${tablet}, ${desktop}`;
}
