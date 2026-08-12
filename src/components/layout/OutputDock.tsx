'use client';

import { useTranslations } from 'next-intl';
import { Monitor, TerminalSquare } from 'lucide-react';
import type { RuntimeKind } from '@/lib/content/types';
import { Panel } from './GameShell';

/**
 * Única decisión de UI que depende del runner (ADR-02): iframe o terminal.
 * Todo lo demás de la app es agnóstico al motor de ejecución.
 */
const TERMINAL_RUNTIMES: RuntimeKind[] = ['webcontainer', 'pyodide', 'remote', 'cli-sim'];

export function OutputDock({ runtimeKind = 'dom' }: { runtimeKind?: RuntimeKind }) {
  const t = useTranslations();
  const isTerminal = TERMINAL_RUNTIMES.includes(runtimeKind);

  return (
    <Panel
      className="h-full"
      title={
        <span className="flex items-center gap-2">
          {isTerminal ? <TerminalSquare size={13} /> : <Monitor size={13} />}
          {isTerminal ? t('panels.terminal') : t('panels.preview')}
        </span>
      }
      action={
        <span className="rounded border border-[var(--color-border)] px-1.5 py-0.5 font-mono text-[10px] uppercase text-[var(--color-ink-faint)]">
          {runtimeKind}
        </span>
      }
    >
      <div className="flex h-full items-center justify-center rounded border border-dashed border-[var(--color-border)] bg-[var(--color-void)]">
        <p className="text-xs text-[var(--color-ink-faint)]">
          {isTerminal ? '$ _' : t('empty.buildingWorld')}
        </p>
      </div>
    </Panel>
  );
}
