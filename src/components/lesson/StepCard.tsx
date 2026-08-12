'use client';

import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, ShieldCheck, Target } from 'lucide-react';
import { useCurrentStep, useLessonStore } from '@/stores/useLessonStore';
import { Panel } from '@/components/layout/GameShell';
import { Markdown } from './Markdown';

export function StepCard() {
  const t = useTranslations();
  const step = useCurrentStep();
  const stepIndex = useLessonStore((s) => s.stepIndex);
  const total = useLessonStore((s) => s.lesson?.steps.length ?? 0);
  const nextStep = useLessonStore((s) => s.nextStep);
  const previousStep = useLessonStore((s) => s.previousStep);

  if (!step) {
    return (
      <Panel title={t('panels.guide')}>
        <p className="text-xs text-[var(--color-ink-faint)]">{t('empty.noLesson')}</p>
      </Panel>
    );
  }

  return (
    <Panel
      title={t('panels.guide')}
      action={
        <span className="font-mono text-[10px] text-[var(--color-ink-faint)]">
          {t('steps.counter', { current: stepIndex + 1, total })}
        </span>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Progreso por pasos: segmentos, no barra continua — se lee de un vistazo. */}
        <div className="flex gap-1">
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className={
                'h-1 flex-1 rounded-full ' +
                (i < stepIndex
                  ? 'bg-[var(--color-success)]'
                  : i === stepIndex
                    ? 'bg-[var(--color-neon)]'
                    : 'bg-[var(--color-border)]')
              }
            />
          ))}
        </div>

        <h3 className="text-sm font-semibold text-[var(--color-ink)]">{step.title}</h3>

        <Markdown>{step.body}</Markdown>

        <div className="rounded-lg border border-[var(--color-neon)]/30 bg-[var(--color-neon)]/5 p-3">
          <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-neon)]">
            <Target size={11} />
            {t('steps.task')}
          </p>
          <p className="text-[13px] leading-relaxed text-[var(--color-ink)]">{step.task}</p>
        </div>

        {step.bestPractice && (
          <div className="rounded-lg border border-[var(--color-power)]/30 bg-[var(--color-power)]/5 p-3">
            <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-power)]">
              <ShieldCheck size={11} />
              {t('steps.bestPractice')}
            </p>
            <Markdown>{step.bestPractice}</Markdown>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={previousStep}
            disabled={stepIndex === 0}
            className="flex items-center gap-1 rounded-md border border-[var(--color-border)] px-2.5 py-1.5 text-xs text-[var(--color-ink-dim)] transition-colors hover:border-[var(--color-border-glow)] hover:text-[var(--color-ink)] disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft size={13} />
            {t('steps.previous')}
          </button>
          <span className="font-mono text-[10px] text-[var(--color-ink-faint)]">
            +{step.xp} XP
          </span>
          <button
            type="button"
            onClick={nextStep}
            disabled={stepIndex >= total - 1}
            className="flex items-center gap-1 rounded-md bg-[var(--color-neon)] px-2.5 py-1.5 text-xs font-semibold text-[var(--color-void)] transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-30"
          >
            {t('steps.next')}
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </Panel>
  );
}
