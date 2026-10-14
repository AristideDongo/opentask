import type { MessageKey } from '../constants/messages';
import { useI18n } from '../hooks/useI18n';
import type { AuditEntryVM } from '../types/workspace.types';

export function ActivityList({ entries }: { entries: AuditEntryVM[] }) {
  const { t, formatDate } = useI18n();
  return (
    <ol className="divide-y divide-line">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
        >
          <span className="text-[0.9375rem]">
            {t(`audit.${entry.action}` as MessageKey, {
              actor: entry.actorName ?? t('audit.someone'),
              email: entry.email,
              from: entry.fromRole ? t(`role.${entry.fromRole}`) : '',
              to: entry.toRole ? t(`role.${entry.toRole}`) : '',
            })}
          </span>
          <time dateTime={entry.createdAt} className="shrink-0 text-sm text-muted">
            {formatDate(entry.createdAt)}
          </time>
        </li>
      ))}
    </ol>
  );
}
