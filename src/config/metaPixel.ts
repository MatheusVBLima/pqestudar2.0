// Meta Pixel Configuration
// Use environment variable with fallback to hardcoded ID
export const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || "4463744813854271";

// Disable pixel in development if env var is set
export const PIXEL_DISABLED = import.meta.env.VITE_DISABLE_META_PIXEL === "true";

export const CURRENCY = "BRL";
export const ROUTE_LANDING = "/mapa-dos-beneficios";
export const ROUTE_THANKYOU = "/obrigado";

// Enable debug logging in development
export const PIXEL_DEBUG = import.meta.env.DEV;

// Get order value from URL query params or state
export const GET_ORDER_VALUE = (): number | null => {
  const urlParams = new URLSearchParams(window.location.search);
  const value = urlParams.get('v') || urlParams.get('value');
  if (value) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
};

/**
 * Utility function to track Meta Pixel events programmatically
 * @param event - Event name (e.g., 'Purchase', 'Lead', 'ViewContent')
 * @param params - Optional event parameters
 */
export function trackMetaPixel(event: string, params?: Record<string, any>): void {
  if (typeof window !== 'undefined' && window.fbq && !PIXEL_DISABLED) {
    window.fbq('track', event, params || {});
  }
}

/**
 * Utility function to track custom Meta Pixel events
 * @param event - Custom event name
 * @param params - Optional event parameters
 */
export function trackMetaPixelCustom(event: string, params?: Record<string, any>): void {
  if (typeof window !== 'undefined' && window.fbq && !PIXEL_DISABLED) {
    window.fbq('trackCustom', event, params || {});
  }
}
