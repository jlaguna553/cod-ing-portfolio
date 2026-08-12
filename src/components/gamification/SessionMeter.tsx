'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Gauge } from 'lucide-react';
import { useSessionStore } from '@/stores/useSessionStore';

/**
 * Medidor de sesión — pieza de verificación del criterio de salida de la Fase 1.
 *
 * Las pulsaciones viven en un store de módulo (Zustand), no en `useState`, así
 * que cambiar de idioma remonta este componente pero el contador NO se reinicia.
 * Es la prueba de que el progreso sobrevive al `[locale]` switch (ADR-01).
 *
 * El contador real se cablea a Monaco en la Fase 5; aquí se alimenta del
 * documento para poder probar el comportamiento ya.
 */
export function SessionMeter() {
  const t = useTranslations();
  const keystrokes = useSessionStore((s) => s.keystrokes);
  const performanceMode = useSessionStore((s) => s.performanceMode);
  const setPerformanceMode = useSessionStore((s) => s.setPerformanceMode);
  const registerKeystroke = useSessionStore((s) => s.registerKeystroke);

  // Evita desajuste de hidratación: el valor persistido solo existe en cliente.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.length === 1 || e.key === 'Enter' || e.key === 'Backspace') registerKeystroke();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [registerKeystroke]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="flex items-center gap-2 text-xs text-[var(--color-ink-dim)]">
          <Gauge size={13} />
          {t('hud.level', { level: 1 })}
        </span>
        <span className="text-xs text-[var(--color-ink-faint)]">
          {t('hud.xp', { current: 0, next: 250 })}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-abyss)]">
        <div className="h-full w-0 rounded-full bg-[var(--color-neon)] transition-[width] duration-500" />
      </div>

      <p className="font-mono text-2xl tabular-nums text-[var(--color-neon)] text-glow">
        {mounted ? keystrokes.toLocaleString() : '—'}
      </p>
      <p className="-mt-2 text-[11px] uppercase tracking-widest text-[var(--color-ink-faint)]">
        {t('hud.keystrokes', { count: '' }).trim()}
      </p>

      <label className="mt-1 flex cursor-pointer items-center gap-2 text-xs text-[var(--color-ink-dim)]">
        <input
          type="checkbox"
          checked={performanceMode}
          onChange={(e) => setPerformanceMode(e.target.checked)}
          className="size-3.5 accent-[var(--color-neon)]"
        />
        <span title={t('editor.performanceModeHint')}>{t('editor.performanceMode')}</span>
      </label>
    </div>
  );
}
