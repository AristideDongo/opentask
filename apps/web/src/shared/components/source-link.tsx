import { useI18n } from '../hooks/useI18n';

export const SOURCE_URL: string | undefined = import.meta.env.VITE_SOURCE_URL || undefined;

export function SourceLink({ className }: { className?: string }) {
  const { t } = useI18n();
  if (!SOURCE_URL) return null;
  return (
    <a href={SOURCE_URL} className={className} rel="noopener">
      {t('app.source')}
    </a>
  );
}
