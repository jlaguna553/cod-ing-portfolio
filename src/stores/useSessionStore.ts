import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Estado de sesión que sobrevive al cambio de idioma.
 *
 * Por qué existe ya en la Fase 1: en el App Router, `/es/...` → `/en/...`
 * cambia el segmento `[locale]`, así que React **remonta** el subárbol. Todo
 * lo que viviera en `useState` se perdería al cambiar de idioma — combo, XP,
 * pulsaciones, buffer del editor.
 *
 * La garantía del ADR-01 ("cambiar idioma no reinicia el progreso") no se
 * consigue con trucos de routing, sino teniendo el estado FUERA del árbol de
 * React. Este store es de módulo: el remount no lo toca.
 *
 * En la Fase 6 `useGameStore` absorbe esto y añade combo, energía y logros.
 */
interface SessionState {
  keystrokes: number;
  startedAt: number;
  performanceMode: boolean;

  registerKeystroke: () => void;
  setPerformanceMode: (enabled: boolean) => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      keystrokes: 0,
      startedAt: Date.now(),
      performanceMode: false,

      registerKeystroke: () => set((s) => ({ keystrokes: s.keystrokes + 1 })),

      setPerformanceMode: (enabled) => {
        // El CSS lee este atributo para apagar TODAS las animaciones de golpe.
        if (typeof document !== 'undefined') {
          document.documentElement.dataset.performanceMode = String(enabled);
        }
        set({ performanceMode: enabled });
      },

      resetSession: () => set({ keystrokes: 0, startedAt: Date.now() }),
    }),
    {
      name: 'codequest.session',
      // `startedAt` no se persiste: cada visita abre una sesión nueva.
      partialize: (s) => ({ keystrokes: s.keystrokes, performanceMode: s.performanceMode }),
    },
  ),
);
