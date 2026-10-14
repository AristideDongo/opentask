import { useRevalidator } from 'react-router';
import { Button } from '../../../shared/components/button';
import { Section } from '../../../shared/components/section';
import { useI18n } from '../../../shared/hooks/useI18n';
import { useToast } from '../../../shared/hooks/useToast';
import type { InvitationVM } from '../../../shared/types/workspace.types';
import { revokeInvitation } from '../servers/members.service';

export function PendingInvitations({
  workspaceId,
  invitations,
}: {
  workspaceId: string;
  invitations: InvitationVM[];
}) {
  const { t, formatDate, errorMessage } = useI18n();
  const { notify } = useToast();
  const revalidator = useRevalidator();

  const revoke = async (invitationId: string) => {
    try {
      await revokeInvitation(workspaceId, invitationId);
      await revalidator.revalidate();
      notify(t('members.pending.revoked'));
    } catch (e) {
      notify(errorMessage(e));
    }
  };

  return (
    <Section title={t('members.pending.title')}>
      {invitations.length === 0 ? (
        <p className="text-muted">{t('members.pending.empty')}</p>
      ) : (
        <ul className="divide-y divide-line">
          {invitations.map((inv) => (
            <li key={inv.id} className="flex flex-wrap items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{inv.email}</p>
                <p className="text-sm text-muted">
                  {t(`role.${inv.role}`)}
                  {inv.invitedByName && `, ${t('members.pending.by', { name: inv.invitedByName })}`}
                </p>
                <p className="text-sm text-muted">
                  {t('members.pending.expires', {
                    date: formatDate(inv.expiresAt, { dateStyle: 'medium' }),
                  })}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => void revoke(inv.id)}>
                {t('members.pending.revoke')}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
