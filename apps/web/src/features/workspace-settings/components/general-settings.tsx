import { zodResolver } from '@hookform/resolvers/zod';
import {
  UpdateWorkspaceInputSchema,
  type UpdateWorkspaceInput,
} from '@opentask/contracts/workspaces/workspace';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRevalidator } from 'react-router';
import { Alert } from '../../../shared/components/alert';
import { Button } from '../../../shared/components/button';
import { Field, Input } from '../../../shared/components/form-controls';
import { Section } from '../../../shared/components/section';
import { useI18n } from '../../../shared/hooks/useI18n';
import { useToast } from '../../../shared/hooks/useToast';
import type { WorkspaceVM } from '../../../shared/types/workspace.types';
import { updateWorkspace } from '../servers/workspace-settings.service';

export function GeneralSettings({ workspace }: { workspace: WorkspaceVM }) {
  const { t, errorMessage, fieldError } = useI18n();
  const { notify } = useToast();
  const revalidator = useRevalidator();
  const [error, setError] = useState<string | null>(null);
  const editable = workspace.permissions.canUpdate;
  const { register, handleSubmit, formState, reset } = useForm<UpdateWorkspaceInput>({
    resolver: zodResolver(UpdateWorkspaceInputSchema),
    defaultValues: { name: workspace.name },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await updateWorkspace(workspace.id, values);
      reset(values);
      await revalidator.revalidate();
      notify(t('common.saved'));
    } catch (e) {
      setError(errorMessage(e));
    }
  });

  return (
    <Section
      title={t('settings.general')}
      description={editable ? undefined : t('settings.readOnly')}
    >
      {error && (
        <div className="mb-4">
          <Alert tone="error">{error}</Alert>
        </div>
      )}
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex max-w-xl flex-col gap-4 sm:flex-row sm:items-start"
      >
        <div className="flex-1">
          <Field label={t('workspace.name')} error={fieldError('name', formState.errors.name)}>
            {(p) => <Input {...p} {...register('name')} readOnly={!editable} />}
          </Field>
        </div>
        {editable && (
          <Button
            type="submit"
            busy={formState.isSubmitting}
            disabled={!formState.isDirty}
            className="sm:mt-[1.625rem]"
          >
            {t('common.save')}
          </Button>
        )}
      </form>
    </Section>
  );
}
