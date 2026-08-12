'use client';

import { useEffect } from 'react';
import { useSessionStore } from '@/stores/useSessionStore';

/**
 * Sincroniza el modo rendimiento persistido con el atributo del <html> que
 * lee `globals.css`. Se monta una vez en el layout y no renderiza nada.
 */
export function PerformanceModeBoot() {
  const performanceMode = useSessionStore((s) => s.performanceMode);

  useEffect(() => {
    document.documentElement.dataset.performanceMode = String(performanceMode);
  }, [performanceMode]);

  return null;
}
