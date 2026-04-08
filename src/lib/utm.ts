const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
const SESSION_KEY = 'trilha_utms';

export function captureUtms(): void {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  const utms: Record<string, string> = {};
  for (const key of UTM_PARAMS) {
    const val = params.get(key);
    if (val) utms[key] = val;
  }
  if (Object.keys(utms).length > 0) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(utms));
  }
}

export function appendUtms(url: string): string {
  if (typeof window === 'undefined') return url;
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (!stored) return url;
    const utms = JSON.parse(stored) as Record<string, string>;
    const parsed = new URL(url);
    for (const [key, value] of Object.entries(utms)) {
      parsed.searchParams.set(key, value);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}
