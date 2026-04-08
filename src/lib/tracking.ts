declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

export function trackCtaClick(buttonText: string, buttonLocation: string): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', 'cta_click', {
    button_text: buttonText,
    button_location: buttonLocation,
  });
}

export function trackBeginCheckout(): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', 'begin_checkout');
}
