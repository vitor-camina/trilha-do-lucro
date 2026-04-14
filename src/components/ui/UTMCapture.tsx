'use client';

import { useEffect } from 'react';
import { captureUtms } from '@/lib/analytics';

/**
 * Renderiza null. Captura UTMs da URL no mount em qualquer página.
 * Inserido no RootLayout para garantir cobertura total.
 */
export function UTMCapture(): null {
  useEffect(() => {
    captureUtms();
  }, []);

  return null;
}
