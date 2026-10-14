import { useLoaderData } from 'react-router';
import { PageHeader } from '../../shared/components/page-header';
import { useI18n } from '../../shared/hooks/useI18n';
import { useWorkspaceData } from '../../shared/hooks/useWorkspaceData';
import { AuditLog } from './components/audit-log';
import { DeleteWorkspace } from './components/delete-workspace';
import { GeneralSettings } from './components/general-settings';
import { LeaveWorkspace } from './components/leave-workspace';
import { TransferOwnership } from './components/transfer-ownership';
import { workspaceSettingsLoader } from './servers/workspace-settings.loader';

export const clientLoader = workspaceSettingsLoader;

export default function WorkspaceSettingsPage() {
  const { audit } = useLoaderData<typeof workspaceSettingsLoader>();
  const { workspace, members } = useWorkspaceData();
  const { t } = useI18n();

  return (
    <>
      <PageHeader title={t('settings.title')} />
      <div className="space-y-6">
        <GeneralSettings workspace={workspace} />
        {audit && <AuditLog workspaceId={workspace.id} initial={audit} />}
        {workspace.permissions.canTransferOwnership && (
          <TransferOwnership workspaceId={workspace.id} members={members} />
        )}
        <LeaveWorkspace workspace={workspace} />
        {workspace.permissions.canDelete && <DeleteWorkspace workspace={workspace} />}
      </div>
    </>
  );
}
