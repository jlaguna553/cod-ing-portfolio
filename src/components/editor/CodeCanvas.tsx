'use client';

import { useTranslations } from 'next-intl';
import { Play, RotateCcw } from 'lucide-react';
import { useLessonStore } from '@/stores/useLessonStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { Panel } from '@/components/layout/GameShell';

/**
 * Editor — implementación provisional con `<textarea>`.
 *
 * Monaco entra en la Fase 5 junto con el Power Mode y las decoraciones de
 * daño. Se usa un textarea ahora, y no un bloque estático, porque el buffer
 * editable es lo que hace verificable el ADR-01: escribes código, cambias de
 * idioma, y el código sigue ahí. Con un placeholder no se podría comprobar.
 *
 * El contrato con el store (`files`, `updateFile`, `activeFile`) es el mismo
 * que consumirá Monaco, así que el cambio de Fase 5 no toca nada más.
 */
export function CodeCanvas() {
  const t = useTranslations();
  const activeFile = useLessonStore((s) => s.activeFile);
  const files = useLessonStore((s) => s.files);
  const updateFile = useLessonStore((s) => s.updateFile);
  const resetWorkspace = useLessonStore((s) => s.resetWorkspace);
  const fileMeta = useLessonStore((s) =>
    s.lesson?.workspace.files.find((f) => f.path === s.activeFile),
  );
  const registerKeystroke = useSessionStore((s) => s.registerKeystroke);

  if (!activeFile) {
    return (
      <Panel className="h-full" title="—">
        <p className="text-xs text-[var(--color-ink-faint)]">{t('empty.noLesson')}</p>
      </Panel>
    );
  }

  const readOnly = fileMeta?.readOnly ?? false;

  return (
    <Panel
      className="h-full"
      title={<span className="font-mono normal-case tracking-normal">{activeFile}</span>}
      action={
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={resetWorkspace}
            className="flex items-center gap-1 rounded-md border border-[var(--color-border)] px-2 py-1 text-[10px] uppercase text-[var(--color-ink-dim)] transition-colors hover:border-[var(--color-border-glow)] hover:text-[var(--color-ink)]"
          >
            <RotateCcw size={11} />
            {t('editor.reset')}
          </button>
          <button
            type="button"
            className="flex items-center gap-1 rounded-md bg-[var(--color-success)] px-2 py-1 text-[10px] font-semibold uppercase text-[var(--color-void)] transition-opacity hover:opacity-90"
          >
            <Play size={11} />
            {t('editor.run')}
          </button>
        </div>
      }
    >
      <textarea
        value={files[activeFile] ?? ''}
        readOnly={readOnly}
        spellCheck={false}
        onChange={(e) => updateFile(activeFile, e.target.value)}
        onKeyDown={(e) => {
          if (e.key.length === 1 || e.key === 'Enter' || e.key === 'Backspace') {
            registerKeystroke();
          }
        }}
        className="h-full w-full resize-none rounded border border-[var(--color-border)] bg-[var(--color-void)] p-3 font-mono text-[12.5px] leading-relaxed text-[var(--color-ink)] outline-none focus:border-[var(--color-neon)]/50 read-only:text-[var(--color-ink-dim)]"
      />
    </Panel>
  );
}
