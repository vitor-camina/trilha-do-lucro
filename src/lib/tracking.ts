declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    fbq: (...args: unknown[]) => void;
  }
}

export function trackCtaClick(buttonText: string, buttonLocation: string): void {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'cta_click', {
      button_text: buttonText,
      button_location: buttonLocation,
    });
  }
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Lead');
  }
}

export function trackBeginCheckout(): void {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'begin_checkout');
  }
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'InitiateCheckout');
  }
}
