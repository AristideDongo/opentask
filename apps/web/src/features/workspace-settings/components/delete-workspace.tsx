import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../../shared/components/button';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog';
import { Field, Input } from '../../../shared/components/form-controls';
import { Section } from '../../../shared/components/section';
import { useI18n } from '../../../shared/hooks/useI18n';
import type { WorkspaceVM } from '../../../shared/types/workspace.types';
import { deleteWorkspace } from '../servers/workspace-settings.service';

export function DeleteWorkspace({ workspace }: { workspace: WorkspaceVM }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [confirmName, setConfirmName] = useState('');

  return (
    <Section
      title={t('settings.delete.title')}
      description={t('settings.delete.body')}
      tone="danger"
    >
      <ConfirmDialog
        trigger={<Button variant="danger">{t('settings.delete.submit')}</Button>}
        title={t('settings.delete.title')}
        description={t('settings.delete.body')}
        confirmLabel={t('settings.delete.submit')}
        canConfirm={confirmName === workspace.name}
        onConfirm={async () => {
          await deleteWorkspace(workspace.id, confirmName);
          navigate('/', { replace: true });
        }}
      >
        <Field label={t('settings.delete.confirmLabel', { name: workspace.name })}>
          {(p) => (
            <Input
              {...p}
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              autoComplete="off"
            />
          )}
        </Field>
      </ConfirmDialog>
    </Section>
  );
}
