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

export function trackQuizStarted(): void {
  if (typeof window === 'undefined') return;
  if (typeof window.fbq === 'function') {
    window.fbq('trackCustom', 'QuizStarted');
  }
}

export function trackQuizCompleted(): void {
  if (typeof window === 'undefined') return;
  if (typeof window.fbq === 'function') {
    window.fbq('trackCustom', 'QuizCompleted');
  }
}

export function trackBeginCheckout(): void {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'begin_checkout');
  }
  if (typeof window.fbq === 'function') {
    window.fbq('trackCustom', 'CTAClicked', { value: 27, currency: 'BRL' });
    window.fbq('track', 'InitiateCheckout', { value: 27, currency: 'BRL' });
  }
}
