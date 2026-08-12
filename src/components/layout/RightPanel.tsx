'use client';

import { useTranslations } from 'next-intl';
import { FlaskConical } from 'lucide-react';
import { Panel } from './GameShell';
import { StepCard } from '@/components/lesson/StepCard';
import { HintCard } from '@/components/lesson/HintCard';
import { InterviewBrief } from '@/components/lesson/InterviewBrief';
import { useCurrentStepRules } from '@/stores/useLessonStore';

export function RightPanel() {
  const t = useTranslations();
  // Las reglas ocultas (`hidden: true`) no se listan: son los tests que el
  // usuario no debe poder leer antes de resolver.
  const rules = useCurrentStepRules().filter((rule) => !rule.hidden);

  return (
    <div className="flex flex-col gap-3">
      <InterviewBrief />
      <StepCard />
      <HintCard />

      <Panel
        title={<span className="flex items-center gap-2"><FlaskConical size={13} /> {t('panels.tests')}</span>}
        action={
          <span className="font-mono text-[10px] text-[var(--color-ink-faint)]">{rules.length}</span>
        }
      >
        {rules.length === 0 ? (
          <p className="text-xs text-[var(--color-ink-faint)]">{t('tests.runFirst')}</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {rules.map((rule) => (
              <li
                key={rule.id}
                className="flex items-start gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-abyss)] px-2.5 py-2"
              >
                {/* Estado pendiente hasta que el motor de evaluación entre (Fase 4). */}
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[var(--color-ink-faint)]" />
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] leading-snug text-[var(--color-ink-dim)]">
                    {rule.message}
                  </p>
                  <p className="mt-1 flex gap-2 font-mono text-[9px] uppercase text-[var(--color-ink-faint)]">
                    <span>{rule.kind}</span>
                    <span className={rule.severity === 'damage' ? 'text-[var(--color-damage)]' : ''}>
                      {rule.severity}
                    </span>
                    <span>{rule.phase}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
