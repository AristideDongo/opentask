import type { WorkspaceRole } from '@opentask/contracts/workspaces/roles';
import { clsx } from 'clsx';
import { useI18n } from '../hooks/useI18n';

const styles: Record<WorkspaceRole, string> = {
  owner: 'bg-accent text-accent-ink',
  admin: 'bg-accent-soft text-ink',
  member: 'bg-sunken text-ink',
  guest: 'border border-dashed border-line text-muted',
};

export function RoleBadge({ role }: { role: WorkspaceRole }) {
  const { t } = useI18n();
  return (
    <span
      className={clsx(
        'inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold',
        styles[role],
      )}
    >
      {t(`role.${role}`)}
    </span>
  );
}
