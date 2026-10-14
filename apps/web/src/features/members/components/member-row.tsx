import type { AssignableRole } from '@opentask/contracts/workspaces/roles';
import { useState } from 'react';
import { useRevalidator } from 'react-router';
import { Alert } from '../../../shared/components/alert';
import { Avatar } from '../../../shared/components/avatar';
import { Button } from '../../../shared/components/button';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog';
import { Select } from '../../../shared/components/form-controls';
import { RoleBadge } from '../../../shared/components/role-badge';
import { useI18n } from '../../../shared/hooks/useI18n';
import { useToast } from '../../../shared/hooks/useToast';
import type { MemberVM } from '../../../shared/types/workspace.types';
import { changeMemberRole, removeMember } from '../servers/members.service';

export function MemberRow({ workspaceId, member }: { workspaceId: string; member: MemberVM }) {
  const { t, errorMessage } = useI18n();
  const { notify } = useToast();
  const revalidator = useRevalidator();
  const [error, setError] = useState<string | null>(null);

  const changeRole = async (role: AssignableRole) => {
    setError(null);
    try {
      await changeMemberRole(workspaceId, member.id, role);
      await revalidator.revalidate();
      notify(t('members.roleChanged', { name: member.name }));
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  return (
    <li className="py-3">
      <div className="flex flex-wrap items-center gap-3">
        <Avatar initials={member.initials} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">
            {member.name}
            {member.isMe && <span className="font-normal text-muted"> ({t('members.you')})</span>}
          </p>
          <p className="truncate text-sm text-muted">{member.email}</p>
        </div>
        <div className="flex items-center gap-2">
          {member.canChangeRole ? (
            <Select
              aria-label={t('members.role', { name: member.name })}
              value={member.role}
              onChange={(e) => void changeRole(e.target.value as AssignableRole)}
              className="h-9 w-auto text-sm"
            >
              {member.roleOptions.map((role) => (
                <option key={role} value={role}>
                  {t(`role.${role}`)}
                </option>
              ))}
            </Select>
          ) : (
            <RoleBadge role={member.role} />
          )}
          {member.canRemove && (
            <ConfirmDialog
              trigger={
                <Button variant="ghost" size="sm">
                  {t('members.remove')}
                </Button>
              }
              title={t('members.removeTitle', { name: member.name })}
              description={t('members.removeBody', { name: member.name })}
              confirmLabel={t('members.remove')}
              onConfirm={async () => {
                await removeMember(workspaceId, member.id);
                await revalidator.revalidate();
                notify(t('members.removed', { name: member.name }));
              }}
            />
          )}
        </div>
      </div>
      {error && (
        <div className="mt-2">
          <Alert tone="error">{error}</Alert>
        </div>
      )}
    </li>
  );
}
