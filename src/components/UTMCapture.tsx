'use client';

import { useEffect } from 'react';
import { captureUtms } from '@/lib/utm';

export function UTMCapture() {
  useEffect(() => {
    captureUtms();
  }, []);
  return null;
}
