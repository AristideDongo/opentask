import { useNavigate } from 'react-router';
import { APP_HOME } from '../../../shared/constants/paths';
import { Button } from '../../../shared/components/button';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog';
import { Section } from '../../../shared/components/section';
import { useI18n } from '../../../shared/hooks/useI18n';
import { useSessionData } from '../../../shared/hooks/useSessionData';
import type { WorkspaceVM } from '../../../shared/types/workspace.types';
import { leaveWorkspace } from '../servers/workspace-settings.service';

export function LeaveWorkspace({ workspace }: { workspace: WorkspaceVM }) {
  const { me } = useSessionData();
  const { t } = useI18n();
  const navigate = useNavigate();
  const isOwner = workspace.role === 'owner';

  return (
    <Section
      title={t('settings.leave.title')}
      description={isOwner ? t('settings.leave.ownerBody') : t('settings.leave.body')}
    >
      <ConfirmDialog
        trigger={
          <Button variant="secondary" disabled={isOwner}>
            {t('settings.leave.submit')}
          </Button>
        }
        title={t('settings.leave.confirm', { name: workspace.name })}
        description={t('settings.leave.body')}
        confirmLabel={t('settings.leave.submit')}
        onConfirm={async () => {
          await leaveWorkspace(workspace.id, me.id);
          navigate(APP_HOME, { replace: true });
        }}
      />
    </Section>
  );
}
