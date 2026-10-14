import { useLoaderData } from 'react-router';
import { PageHeader } from '../../shared/components/page-header';
import { Section } from '../../shared/components/section';
import { useI18n } from '../../shared/hooks/useI18n';
import { useWorkspaceData } from '../../shared/hooks/useWorkspaceData';
import { InviteForm } from './components/invite-form';
import { MemberRow } from './components/member-row';
import { PendingInvitations } from './components/pending-invitations';
import { membersLoader } from './servers/members.loader';

export const clientLoader = membersLoader;

export default function MembersPage() {
  const { invitations } = useLoaderData<typeof membersLoader>();
  const { workspace, members } = useWorkspaceData();
  const { t } = useI18n();

  return (
    <>
      <PageHeader title={t('members.title')}>{t('members.intro')}</PageHeader>
      <div className="space-y-6">
        {workspace.permissions.canInvite && (
          <InviteForm
            workspaceId={workspace.id}
            grantableRoles={workspace.permissions.grantableRoles}
          />
        )}
        <Section title={`${t('members.title')} (${members.length})`}>
          <ul className="divide-y divide-line">
            {members.map((member) => (
              <MemberRow key={member.id} workspaceId={workspace.id} member={member} />
            ))}
          </ul>
        </Section>
        {invitations && <PendingInvitations workspaceId={workspace.id} invitations={invitations} />}
      </div>
    </>
  );
}
