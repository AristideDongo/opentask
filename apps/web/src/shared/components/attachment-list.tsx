import { Download, FileText, Trash2 } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import { formatFileSize } from '../mappers/content.mapper';
import type { AttachmentVM } from '../types/content.types';

export function AttachmentList({
  attachments,
  onDelete,
  imageClassName = 'h-32 w-32',
}: {
  attachments: AttachmentVM[];
  onDelete?(attachment: AttachmentVM): void;
  imageClassName?: string;
}) {
  const { t, locale } = useI18n();
  const images = attachments.filter((a) => a.isImage);
  const files = attachments.filter((a) => !a.isImage);
  if (attachments.length === 0) return null;
  return (
    <div className="mt-2 space-y-2">
      {images.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {images.map((image) => (
            <li key={image.id} className="group relative">
              <a
                href={image.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-[var(--radius-control)] border border-line bg-sunken"
              >
                <img
                  src={image.url}
                  alt={image.fileName}
                  loading="lazy"
                  className={`${imageClassName} object-cover`}
                />
              </a>
              {onDelete && image.canDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(image)}
                  className="absolute top-1 right-1 rounded bg-ink/70 p-1 text-bg opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:opacity-100"
                >
                  <Trash2 aria-hidden className="size-3.5" />
                  <span className="sr-only">{t('files.delete', { name: image.fileName })}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {files.length > 0 && (
        <ul className="space-y-1.5">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex max-w-md items-center gap-2.5 rounded-[var(--radius-control)] border border-line bg-surface px-3 py-2 text-sm"
            >
              <FileText aria-hidden className="size-4 shrink-0 text-accent" />
              <span className="min-w-0 flex-1 truncate" title={file.fileName}>
                {file.fileName}
              </span>
              <span className="shrink-0 text-xs text-muted">
                {formatFileSize(file.size, locale)}
              </span>
              <a
                href={file.url}
                download={file.fileName}
                className="rounded p-1 text-muted hover:text-accent"
              >
                <Download aria-hidden className="size-4" />
                <span className="sr-only">{t('files.download', { name: file.fileName })}</span>
              </a>
              {onDelete && file.canDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(file)}
                  className="rounded p-1 text-muted hover:text-danger"
                >
                  <Trash2 aria-hidden className="size-4" />
                  <span className="sr-only">{t('files.delete', { name: file.fileName })}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
