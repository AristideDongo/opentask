import { AlertCircle, FileText, LoaderCircle, X } from 'lucide-react';
import { useI18n } from '../../../shared/hooks/useI18n';
import type { PendingUploadVM } from '../channel.types';

export function PendingUploads({
  uploads,
  onRemove,
}: {
  uploads: PendingUploadVM[];
  onRemove(key: string): void;
}) {
  const { t } = useI18n();
  if (uploads.length === 0) return null;
  return (
    <ul className="mb-2 flex flex-wrap gap-2" aria-label={t('files.title')}>
      {uploads.map((upload) => (
        <li
          key={upload.key}
          className="flex max-w-xs items-center gap-2 rounded-[var(--radius-control)] border border-line bg-sunken px-2.5 py-1.5 text-sm"
          title={
            upload.error
              ? t('files.failed', { name: upload.fileName, reason: upload.error })
              : upload.fileName
          }
        >
          {upload.status === 'uploading' ? (
            <LoaderCircle aria-hidden className="size-4 shrink-0 animate-spin text-muted" />
          ) : upload.status === 'error' ? (
            <AlertCircle aria-hidden className="size-4 shrink-0 text-danger" />
          ) : (
            <FileText aria-hidden className="size-4 shrink-0 text-accent" />
          )}
          <span className="min-w-0 truncate">{upload.fileName}</span>
          {upload.status === 'uploading' && (
            <span className="sr-only">{t('files.uploading', { name: upload.fileName })}</span>
          )}
          {upload.status === 'error' && upload.error && (
            <span role="alert" className="sr-only">
              {t('files.failed', { name: upload.fileName, reason: upload.error })}
            </span>
          )}
          <button
            type="button"
            onClick={() => onRemove(upload.key)}
            className="shrink-0 rounded p-0.5 text-muted hover:text-ink"
          >
            <X aria-hidden className="size-3.5" />
            <span className="sr-only">{t('files.remove', { name: upload.fileName })}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
