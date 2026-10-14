import { zodResolver } from '@hookform/resolvers/zod';
import { TASK_PRIORITIES } from '@opentask/contracts/tasks/status';
import { CreateTaskInputSchema, type CreateTaskInput } from '@opentask/contracts/tasks/task';
import type { ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useRevalidator } from 'react-router';
import { Alert } from '../../../shared/components/alert';
import { Button } from '../../../shared/components/button';
import { Field, Input, Select, Textarea } from '../../../shared/components/form-controls';
import { LabelPicker } from '../../../shared/components/label-picker';
import { Modal } from '../../../shared/components/modal';
import { useDialogSubmit } from '../../../shared/hooks/useDialogSubmit';
import { useI18n } from '../../../shared/hooks/useI18n';
import { useToast } from '../../../shared/hooks/useToast';
import { useWorkspaceData } from '../../../shared/hooks/useWorkspaceData';
import { createTask } from '../../../shared/servers/task.service';
import type { ProjectVM } from '../../../shared/types/project.types';

export function CreateTaskDialog({
  project,
  trigger,
  defaultColumnId,
}: {
  project: ProjectVM;
  trigger: ReactNode;
  defaultColumnId?: string;
}) {
  const { workspace, members } = useWorkspaceData();
  const { t, fieldError } = useI18n();
  const { notify } = useToast();
  const revalidator = useRevalidator();
  const { open, setOpen, error, submit } = useDialogSubmit<unknown>();
  const defaults: CreateTaskInput = {
    title: '',
    description: '',
    columnId: defaultColumnId ?? project.columns[0]?.id,
    priority: 'normal',
    dueDate: null,
    assigneeId: null,
    labelIds: [],
  };
  const { register, handleSubmit, formState, reset, control } = useForm<CreateTaskInput>({
    resolver: zodResolver(CreateTaskInputSchema),
    defaultValues: defaults,
  });
  const column = project.columns.find((c) => c.id === defaultColumnId);

  return (
    <Modal
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) reset(defaults);
      }}
      trigger={trigger}
      title={column ? t('task.createIn', { status: column.name }) : t('task.createTitle')}
    >
      <form
        noValidate
        className="space-y-4"
        onSubmit={handleSubmit((values) =>
          submit(
            () =>
              createTask(workspace.id, project.id, {
                ...values,
                dueDate: values.dueDate || null,
                assigneeId: values.assigneeId || null,
              }),
            () => {
              notify(t('task.created'));
              void revalidator.revalidate();
            },
          ),
        )}
      >
        {error && <Alert tone="error">{error}</Alert>}
        <Field label={t('task.title')} error={fieldError('title', formState.errors.title)}>
          {(p) => <Input {...p} {...register('title')} maxLength={200} autoFocus />}
        </Field>
        <Field label={`${t('task.description')} (${t('common.optional')})`}>
          {(p) => (
            <Textarea
              {...p}
              {...register('description')}
              rows={3}
              placeholder={t('task.descriptionPlaceholder')}
            />
          )}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('task.status')}>
            {(p) => (
              <Select {...p} {...register('columnId')}>
                {project.columns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label={t('task.priority')}>
            {(p) => (
              <Select {...p} {...register('priority')}>
                {TASK_PRIORITIES.map((pr) => (
                  <option key={pr} value={pr}>
                    {t(`priority.${pr}`)}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label={t('task.assignee')}>
            {(p) => (
              <Select {...p} {...register('assigneeId')}>
                <option value="">{t('task.unassigned')}</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label={t('task.dueDate')} error={fieldError('dueDate', formState.errors.dueDate)}>
            {(p) => <Input {...p} type="date" {...register('dueDate')} />}
          </Field>
        </div>
        <div>
          <p className="mb-1.5 text-sm font-semibold">{t('task.labels')}</p>
          <Controller
            control={control}
            name="labelIds"
            render={({ field }) => (
              <LabelPicker
                labels={project.labels}
                value={field.value ?? []}
                onChange={field.onChange}
              />
            )}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" busy={formState.isSubmitting}>
            {t('task.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
