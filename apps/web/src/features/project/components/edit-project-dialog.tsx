import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { Alert } from '../../../shared/components/alert';
import { Button } from '../../../shared/components/button';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog';
import { Field, Input, Select, Textarea } from '../../../shared/components/form-controls';
import { Modal } from '../../../shared/components/modal';
import { useI18n } from '../../../shared/hooks/useI18n';
import { useToast } from '../../../shared/hooks/useToast';
import { useWorkspaceData } from '../../../shared/hooks/useWorkspaceData';
import type { ProjectVM } from '../../../shared/types/project.types';
import { useProjectMutation } from '../hooks/useProjectMutation';
import {
  EditProjectFormSchema,
  toUpdateProjectInput,
  type EditProjectFormData,
  type EditProjectFormValues,
} from '../project.validators';
import { deleteProject, updateProject } from '../servers/project.service';

export function EditProjectDialog({
  project,
  open,
  onOpenChange,
}: {
  project: ProjectVM;
  open: boolean;
  onOpenChange(open: boolean): void;
}) {
  const { workspace, teams } = useWorkspaceData();
  const { t, fieldError } = useI18n();
  const { notify } = useToast();
  const navigate = useNavigate();
  const { run, error } = useProjectMutation();
  const { register, handleSubmit, formState } = useForm<
    EditProjectFormValues,
    unknown,
    EditProjectFormData
  >({
    resolver: zodResolver(EditProjectFormSchema),
    values: {
      name: project.name,
      description: project.description,
      teamId: project.team?.id ?? '',
    },
  });

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={t('project.edit')}>
      <form
        noValidate
        className="space-y-4"
        onSubmit={handleSubmit(async (values) => {
          if (
            await run(() => updateProject(workspace.id, project.id, toUpdateProjectInput(values)))
          ) {
            onOpenChange(false);
            notify(t('common.saved'));
          }
        })}
      >
        {error && <Alert tone="error">{error}</Alert>}
        <Field label={t('project.name')} error={fieldError('name', formState.errors.name)}>
          {(p) => <Input {...p} {...register('name')} />}
        </Field>
        <Field
          label={t('project.description')}
          error={fieldError('description', formState.errors.description)}
        >
          {(p) => <Textarea {...p} {...register('description')} rows={3} />}
        </Field>
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          {workspace.permissions.canDeleteProject ? (
            <ConfirmDialog
              trigger={
                <Button variant="ghost" className="text-danger">
                  {t('project.delete')}
                </Button>
              }
              title={t('project.delete')}
              description={t('project.deleteBody', { name: project.name })}
              confirmLabel={t('project.delete')}
              onConfirm={async () => {
                await deleteProject(workspace.id, project.id);
                notify(t('project.deleted'));
                navigate(`/w/${workspace.id}`);
              }}
            />
          ) : (
            <span />
          )}
          <Button type="submit" busy={formState.isSubmitting}>
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
