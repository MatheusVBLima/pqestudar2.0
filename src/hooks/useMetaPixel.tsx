import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useCookieConsent } from './useCookieConsent';
import { 
  META_PIXEL_ID, 
  CURRENCY, 
  ROUTE_LANDING, 
  ROUTE_THANKYOU, 
  GET_ORDER_VALUE,
  PIXEL_DEBUG 
} from '@/config/metaPixel';

// Extend window for Meta Pixel
declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    _fbq: any;
    __PIXEL_DEBUG__?: boolean;
  }
}

// Debug logger
const pixelLog = (event: string, data?: any) => {
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

export const useMetaPixel = () => {
  const location = useLocation();
  const { consentData } = useCookieConsent();
  const pixelLoadedRef = useRef(false);
  const scriptInjectedRef = useRef(false);

  // Check if marketing consent is granted
  const hasMarketingConsent = consentData.preferences.marketing;

  // Initialize Meta Pixel script
  useEffect(() => {
    if (scriptInjectedRef.current) return;
    
    // Skip if no valid pixel ID
    if (!META_PIXEL_ID || META_PIXEL_ID === "COLE_SEU_ID_AQUI") {
      pixelLog('Pixel ID not configured, skipping initialization');
      return;
    }

    // Initialize fbq function
    const initFbq = () => {
      if (window.fbq) return;
      
      const n: any = (window.fbq = function (...args: any[]) {
        n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
      });
      
      if (!window._fbq) window._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
    };

    initFbq();

    // Inject the script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://connect.facebook.net/en_US/fbevents.js`;
    
    script.onload = () => {
      // Initialize pixel
      window.fbq('init', META_PIXEL_ID);
      pixelLog('Pixel initialized', META_PIXEL_ID);
      pixelLoadedRef.current = true;
      
      // Fire initial PageView
      window.fbq('track', 'PageView');
      sessionFlags.lastPageView = location.pathname;
      pixelLog('PageView', location.pathname);
    };

    script.onerror = () => {
      console.error('[PIXEL] Failed to load Meta Pixel script');
    };

    document.head.appendChild(script);

    // Add noscript fallback
    const noscript = document.createElement('noscript');
    const img = document.createElement('img');
    img.height = 1;
    img.width = 1;
    img.style.display = 'none';
    img.src = `https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`;
    noscript.appendChild(img);
    document.body.appendChild(noscript);

    scriptInjectedRef.current = true;
  }, []);

  // Track PageView on route changes (SPA)
  useEffect(() => {
    if (!window.fbq || !pixelLoadedRef.current) return;
    
    // Avoid duplicate PageView for same path
    if (sessionFlags.lastPageView === location.pathname) return;
    
    window.fbq('track', 'PageView');
    sessionFlags.lastPageView = location.pathname;
    pixelLog('PageView', location.pathname);
  }, [location.pathname]);

  // Track ViewContent (for landing/VSL)
  const trackViewContent = useCallback((contentName: string = 'Landing VSL', contentCategory: string = 'Oferta') => {
    if (!window.fbq || !hasMarketingConsent) return;
    if (sessionFlags.viewContentFired) return;
    
    window.fbq('track', 'ViewContent', {
      content_name: contentName,
      content_category: contentCategory,
      value: 0,
      currency: CURRENCY,
    });
    sessionFlags.viewContentFired = true;
    pixelLog('ViewContent', { contentName, contentCategory });
  }, [hasMarketingConsent]);

  // Track Lead (for CTA clicks)
  const trackLead = useCallback((contentName: string = 'CTA Hero') => {
    if (!window.fbq || !hasMarketingConsent) return;
    if (!debounce('lead')) return;
    
    window.fbq('track', 'Lead', {
      content_name: contentName,
      value: 0,
      currency: CURRENCY,
    });
    pixelLog('Lead', { contentName });
  }, [hasMarketingConsent]);

  // Track InitiateCheckout (for plan buttons)
  const trackInitiateCheckout = useCallback((plan: 'Basico' | 'Premium') => {
    if (!window.fbq || !hasMarketingConsent) return;
    if (!debounce(`checkout-${plan}`)) return;
    
    window.fbq('track', 'InitiateCheckout', { plan });
    pixelLog('InitiateCheckout', { plan });
  }, [hasMarketingConsent]);

  // Track Purchase (for thank you page)
  const trackPurchase = useCallback((value?: number) => {
    if (!window.fbq || !hasMarketingConsent) return;
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
  }, [hasMarketingConsent]);

  // Custom event tracking
  const trackCustomEvent = useCallback((eventName: string, params?: Record<string, any>) => {
    if (!window.fbq || !hasMarketingConsent) return;
    
    window.fbq('trackCustom', eventName, params);
    pixelLog(`Custom: ${eventName}`, params);
  }, [hasMarketingConsent]);

  return {
    trackViewContent,
    trackLead,
    trackInitiateCheckout,
    trackPurchase,
    trackCustomEvent,
    isReady: pixelLoadedRef.current,
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
  }, [trackViewContent]);
};
