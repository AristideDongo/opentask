import { zodResolver } from '@hookform/resolvers/zod';
import { CreateTeamInputSchema } from '@opentask/contracts/teams/team';
import { type ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import type { z } from 'zod';
import { useDialogSubmit } from '../hooks/useDialogSubmit';
import { useI18n } from '../hooks/useI18n';
import { useWorkspaceData } from '../hooks/useWorkspaceData';
import { createTeam } from '../servers/creation.service';
import { Alert } from './alert';
import { Button } from './button';
import { Field, Input } from './form-controls';
import { MemberPicker } from './member-picker';
import { Modal } from './modal';

type FormValues = z.input<typeof CreateTeamInputSchema>;

export function CreateTeamDialog({ trigger }: { trigger: ReactNode }) {
  const { workspace, members } = useWorkspaceData();
  const { t, fieldError } = useI18n();
  const navigate = useNavigate();
  const { open, setOpen, error, submit } = useDialogSubmit<{ id: string }>();
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const { register, handleSubmit, formState, reset } = useForm<FormValues>({
    resolver: zodResolver(CreateTeamInputSchema),
    defaultValues: { name: '', description: '' },
  });

  return (
    <Modal
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) {
          reset();
          setMemberIds([]);
        }
      }}
      trigger={trigger}
      title={t('team.create.title')}
    >
      <form
        noValidate
        className="space-y-4"
        onSubmit={handleSubmit((values) =>
          submit(
            () => createTeam(workspace.id, { ...values, memberIds }),
            (team) => navigate(`/w/${workspace.id}/teams/${team.id}`),
          ),
        )}
      >
        {error && <Alert tone="error">{error}</Alert>}
        <Field label={t('team.name')} error={fieldError('name', formState.errors.name)}>
          {(p) => (
            <Input {...p} {...register('name')} placeholder={t('team.namePlaceholder')} autoFocus />
          )}
        </Field>
        <Field label={`${t('team.description')} (${t('common.optional')})`}>
          {(p) => <Input {...p} {...register('description')} />}
        </Field>
        <MemberPicker
          label={t('team.members')}
          members={members}
          value={memberIds}
          onChange={setMemberIds}
        />
        <div className="flex justify-end">
          <Button type="submit" busy={formState.isSubmitting}>
            {t('team.create.submit')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
