import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { ChevronRight, Cpu, Layers, Server } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { LocaleSwitch } from '@/components/i18n/LocaleSwitch';
import type { Track } from '@/lib/content/types';

const TRACKS: { id: Track; icon: typeof Layers; color: string; firstLesson: string }[] = [
  { id: 'frontend', icon: Layers, color: 'var(--color-track-frontend)', firstLesson: 'js-03-array-map' },
  { id: 'backend', icon: Server, color: 'var(--color-track-backend)', firstLesson: 'node-01-http' },
  { id: 'devops', icon: Cpu, color: 'var(--color-track-devops)', firstLesson: 'docker-07-layer-cache' },
];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Home />;
}

function Home() {
  const t = useTranslations();

  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-10 px-6 py-16">
      <header className="flex items-start justify-between gap-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--color-neon)]">
            {t('meta.appName')}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[var(--color-ink)]">
            {t('home.title')}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--color-ink-dim)]">{t('home.subtitle')}</p>
        </div>
        <div className="w-40 shrink-0">
          <LocaleSwitch />
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {TRACKS.map(({ id, icon: Icon, color, firstLesson }) => (
          <Link
            key={id}
            href={`/play/${id}/${firstLesson}`}
            className="group flex flex-col gap-3 rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-panel)] p-5 transition-colors hover:border-[var(--color-border-glow)]"
          >
            <Icon size={22} style={{ color }} />
            <h2 className="text-lg font-semibold" style={{ color }}>
              {t(`tracks.${id}.name`)}
            </h2>
            <p className="flex-1 text-xs leading-relaxed text-[var(--color-ink-dim)]">
              {t(`tracks.${id}.description`)}
            </p>
            <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-faint)] transition-colors group-hover:text-[var(--color-ink)]">
              {t('home.start')}
              <ChevronRight size={14} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
