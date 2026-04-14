/**
 * Analytics utilities — UTM passthrough + event tracking.
 * GA4 (G-JG3YNYBKVT) e Meta Pixel (1759395398372894) já são inicializados
 * no layout.tsx; estas funções apenas disparam eventos.
 */

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const;

type UtmKey = (typeof UTM_KEYS)[number];

// ─── Helpers de acesso seguro a window globals ────────────────────────────────

function getGtag(): ((...args: unknown[]) => void) | undefined {
  if (typeof window === 'undefined') return undefined;
  const g = (window as unknown as Record<string, unknown>)['gtag'];
  return typeof g === 'function' ? (g as (...args: unknown[]) => void) : undefined;
}

function getFbq(): ((action: string, event: string) => void) | undefined {
  if (typeof window === 'undefined') return undefined;
  const f = (window as unknown as Record<string, unknown>)['fbq'];
  return typeof f === 'function'
    ? (f as (action: string, event: string) => void)
    : undefined;
}

// ─── UTM Capture / Passthrough ───────────────────────────────────────────────

/**
 * Lê UTMs da URL atual e salva no sessionStorage.
 * Chame no mount da página de entrada (via UTMCapture component).
 */
export function captureUtms(): void {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) {
      sessionStorage.setItem(key as string, value);
    }
  }
}

/**
 * Appenda UTMs capturados (sessionStorage) na URL base.
 * Retorna a URL base se não houver UTMs ou se estiver no servidor.
 */
export function buildHotmartUrl(base: string): string {
  if (typeof window === 'undefined') return base;
  const url = new URL(base);
  for (const key of UTM_KEYS) {
    const value = sessionStorage.getItem(key as string);
    if (value) {
      url.searchParams.set(key as string, value);
    }
  }
  return url.toString();
}

// ─── Event Tracking ──────────────────────────────────────────────────────────

/**
 * Dispara begin_checkout (GA4) + InitiateCheckout (Meta Pixel).
 * Chame imediatamente antes de abrir o checkout Hotmart.
 */
export function trackBeginCheckout(): void {
  getGtag()?.('event', 'begin_checkout');
  getFbq()?.('track', 'InitiateCheckout');
}
