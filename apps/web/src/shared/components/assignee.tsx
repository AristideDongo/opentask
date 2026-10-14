import { useI18n } from '../hooks/useI18n';
import type { PersonVM } from '../types/person.types';
import { Avatar } from './avatar';

export function Assignee({
  person,
  showName = false,
}: {
  person: PersonVM | null;
  showName?: boolean;
}) {
  const { t } = useI18n();
  if (!person)
    return showName ? <span className="text-sm text-muted">{t('task.unassigned')}</span> : null;
  return (
    <span className="inline-flex items-center gap-1.5" title={person.name}>
      <Avatar initials={person.initials} size="sm" />
      {showName ? (
        <span className="truncate text-sm">{person.name}</span>
      ) : (
        <span className="sr-only">{person.name}</span>
      )}
    </span>
  );
}
