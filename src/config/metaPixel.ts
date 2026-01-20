// Meta Pixel Configuration
export const META_PIXEL_ID = "COLE_SEU_ID_AQUI"; // Replace with your actual Pixel ID
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
