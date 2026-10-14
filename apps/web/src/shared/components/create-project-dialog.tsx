import { zodResolver } from '@hookform/resolvers/zod';
import { CreateProjectInputSchema } from '@opentask/contracts/projects/project';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import type { z } from 'zod';
import { useDialogSubmit } from '../hooks/useDialogSubmit';
import { useI18n } from '../hooks/useI18n';
import { useWorkspaceData } from '../hooks/useWorkspaceData';
import { createProject } from '../servers/creation.service';
import { Alert } from './alert';
import { Button } from './button';
import { Field, Input, Select, Textarea } from './form-controls';
import { Modal } from './modal';

type FormValues = z.input<typeof CreateProjectInputSchema>;

export function CreateProjectDialog({
  trigger,
  defaultTeamId = null,
}: {
  trigger: ReactNode;
  defaultTeamId?: string | null;
}) {
  const { workspace, teams } = useWorkspaceData();
  const { t, fieldError } = useI18n();
  const navigate = useNavigate();
  const { open, setOpen, error, submit } = useDialogSubmit<{ id: string }>();
  const { register, handleSubmit, formState, reset } = useForm<FormValues>({
    resolver: zodResolver(CreateProjectInputSchema),
    defaultValues: { name: '', description: '', teamId: defaultTeamId },
  });

  return (
    <Modal
      open={open}
      onOpenChange={(v) => (setOpen(v), v && reset())}
      trigger={trigger}
      title={t('project.create.title')}
    >
      <form
        noValidate
        className="space-y-4"
        onSubmit={handleSubmit((values) =>
          submit(
            () => createProject(workspace.id, { ...values, teamId: values.teamId || null }),
            (p) => navigate(`/w/${workspace.id}/p/${p.id}`),
          ),
        )}
      >
        {error && <Alert tone="error">{error}</Alert>}
        <Field label={t('project.name')} error={fieldError('name', formState.errors.name)}>
          {(p) => (
            <Input
              {...p}
              {...register('name')}
              placeholder={t('project.namePlaceholder')}
              autoFocus
            />
          )}
        </Field>
        <Field label={`${t('project.description')} (${t('common.optional')})`}>
          {(p) => <Textarea {...p} {...register('description')} rows={3} />}
        </Field>
        {teams.length > 0 && (
          <Field label={t('project.team')}>
            {(p) => (
              <Select {...p} {...register('teamId')}>
                <option value="">{t('project.noTeam')}</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        )}
        <div className="flex justify-end">
          <Button type="submit" busy={formState.isSubmitting}>
            {t('project.create.submit')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
