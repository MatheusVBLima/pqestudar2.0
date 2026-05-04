import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useCookieConsent } from './useCookieConsent';
import { 
  META_PIXEL_ID, 
  CURRENCY, 
  GET_ORDER_VALUE,
  PIXEL_DEBUG,
  PIXEL_DISABLED
} from '@/config/metaPixel';

// Extend window for Meta Pixel
declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: unknown;
    __PIXEL_DEBUG__?: boolean;
    __META_PIXEL_LOADED__?: boolean;
  }
}

// Debug logger
const pixelLog = (event: string, data?: unknown) => {
  if (PIXEL_DEBUG || window.__PIXEL_DEBUG__) {
    console.log(`[PIXEL] ${event}`, data || '');
  }
};

// Session flags to prevent duplicate events
const sessionFlags = {
  viewContentFired: false,
  purchaseFired: false,
  lastPageView: '',
};

// Debounce helper
const debounceFlags: Record<string, number> = {};
const debounce = (key: string, delay: number = 1000): boolean => {
  const now = Date.now();
  if (debounceFlags[key] && now - debounceFlags[key] < delay) {
    return false;
  }
  debounceFlags[key] = now;
  return true;
};

const ensureMetaPixelLoaded = () => {
  if (typeof window === 'undefined' || window.__META_PIXEL_LOADED__ || PIXEL_DISABLED) return;

  window.fbq = window.fbq || function fbqStub(...args: unknown[]) {
    const fbq = window.fbq as typeof window.fbq & { q?: unknown[][] };
    fbq.q = fbq.q || [];
    fbq.q.push(args);
  };
  window._fbq = window.fbq;
  window.__META_PIXEL_LOADED__ = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  window.fbq('init', META_PIXEL_ID);
};

export const useMetaPixel = () => {
  const location = useLocation();
  const { consentData } = useCookieConsent();
  const initializedRef = useRef(false);

  // Check if marketing consent is granted
  const hasMarketingConsent = consentData.preferences.marketing;
  
  // Check if pixel is ready (loaded from index.html)
  const isPixelReady = typeof window !== 'undefined' && typeof window.fbq === 'function';

  // Mark as initialized on first render after marketing consent.
  useEffect(() => {
    if (PIXEL_DISABLED) {
      pixelLog('Pixel disabled via environment variable');
      return;
    }

    if (!hasMarketingConsent) return;

    ensureMetaPixelLoaded();

    if (!initializedRef.current && typeof window.fbq === 'function') {
      initializedRef.current = true;
      sessionFlags.lastPageView = location.pathname;
      window.fbq('track', 'PageView');
      pixelLog('Pixel ready', META_PIXEL_ID);
    }
  }, [hasMarketingConsent, location.pathname]);

  // Track PageView on route changes (SPA navigation)
  useEffect(() => {
    if (PIXEL_DISABLED || !isPixelReady) return;
    
    // Avoid duplicate PageView for same path
    if (sessionFlags.lastPageView === location.pathname) return;
    
    // Only track if consent is granted (or if no consent required)
    if (hasMarketingConsent) {
      window.fbq('track', 'PageView');
      sessionFlags.lastPageView = location.pathname;
      pixelLog('PageView (SPA)', location.pathname);
    }
  }, [location.pathname, hasMarketingConsent, isPixelReady]);

  // Track ViewContent (for landing/VSL)
  const trackViewContent = useCallback((contentName: string = 'Landing VSL', contentCategory: string = 'Oferta') => {
    if (PIXEL_DISABLED || !isPixelReady || !hasMarketingConsent) return;
    if (sessionFlags.viewContentFired) return;
    
    window.fbq('track', 'ViewContent', {
      content_name: contentName,
      content_category: contentCategory,
      value: 0,
      currency: CURRENCY,
    });
    sessionFlags.viewContentFired = true;
    pixelLog('ViewContent', { contentName, contentCategory });
  }, [hasMarketingConsent, isPixelReady]);

  // Track Lead (for CTA clicks)
  const trackLead = useCallback((contentName: string = 'CTA Hero') => {
    if (PIXEL_DISABLED || !isPixelReady || !hasMarketingConsent) return;
    if (!debounce('lead')) return;
    
    window.fbq('track', 'Lead', {
      content_name: contentName,
      value: 0,
      currency: CURRENCY,
    });
    pixelLog('Lead', { contentName });
  }, [hasMarketingConsent, isPixelReady]);

  // Track InitiateCheckout (for plan buttons)
  const trackInitiateCheckout = useCallback((plan: 'Basico' | 'Premium') => {
    if (PIXEL_DISABLED || !isPixelReady || !hasMarketingConsent) return;
    if (!debounce(`checkout-${plan}`)) return;
    
    window.fbq('track', 'InitiateCheckout', { plan });
    pixelLog('InitiateCheckout', { plan });
  }, [hasMarketingConsent, isPixelReady]);

  // Track Purchase (for thank you page)
  const trackPurchase = useCallback((value?: number) => {
    if (PIXEL_DISABLED || !isPixelReady || !hasMarketingConsent) return;
    if (sessionFlags.purchaseFired) return;
    
    const orderValue = value ?? GET_ORDER_VALUE();
    if (orderValue === null) {
      pixelLog('Purchase skipped - no value found');
      return;
    }
    
    window.fbq('track', 'Purchase', {
      value: orderValue,
      currency: CURRENCY,
    });
    sessionFlags.purchaseFired = true;
    pixelLog('Purchase', { value: orderValue, currency: CURRENCY });
  }, [hasMarketingConsent, isPixelReady]);

  // Custom event tracking
  const trackCustomEvent = useCallback((eventName: string, params?: Record<string, unknown>) => {
    if (PIXEL_DISABLED || !isPixelReady || !hasMarketingConsent) return;
    
    window.fbq('trackCustom', eventName, params);
    pixelLog(`Custom: ${eventName}`, params);
  }, [hasMarketingConsent, isPixelReady]);

  return {
    trackViewContent,
    trackLead,
    trackInitiateCheckout,
    trackPurchase,
    trackCustomEvent,
    isReady: isPixelReady && !PIXEL_DISABLED,
    hasConsent: hasMarketingConsent,
  };
};

// Hook for automatic ViewContent tracking on landing page
export const useViewContentTracking = (elementRef: React.RefObject<HTMLElement>) => {
  const { trackViewContent } = useMetaPixel();
  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (!elementRef.current || hasFiredRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasFiredRef.current) {
            trackViewContent();
            hasFiredRef.current = true;
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(elementRef.current);

    return () => observer.disconnect();
  }, [elementRef, trackViewContent]);
};
