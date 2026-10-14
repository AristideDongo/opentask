import { zodResolver } from '@hookform/resolvers/zod';
import { CreateChannelInputSchema } from '@opentask/contracts/channels/channel';
import { type ReactNode, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router';
import type { z } from 'zod';
import { useDialogSubmit } from '../hooks/useDialogSubmit';
import { useI18n } from '../hooks/useI18n';
import { useWorkspaceData } from '../hooks/useWorkspaceData';
import { createChannel } from '../servers/creation.service';
import { Alert } from './alert';
import { Button } from './button';
import { Field, Input } from './form-controls';
import { MemberPicker } from './member-picker';
import { Modal } from './modal';

type FormValues = z.input<typeof CreateChannelInputSchema>;

export function CreateChannelDialog({ trigger }: { trigger: ReactNode }) {
  const { workspace, members } = useWorkspaceData();
  const { t, fieldError } = useI18n();
  const navigate = useNavigate();
  const { open, setOpen, error, submit } = useDialogSubmit<{ id: string }>();
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const { register, handleSubmit, formState, reset, control } = useForm<FormValues>({
    resolver: zodResolver(CreateChannelInputSchema),
    defaultValues: { name: '', description: '', isPrivate: false },
  });
  const isPrivate = useWatch({ control, name: 'isPrivate' });
  const others = members.filter((m) => !m.isMe);

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
      title={t('channel.create.title')}
    >
      <form
        noValidate
        className="space-y-4"
        onSubmit={handleSubmit((values) =>
          submit(
            () => createChannel(workspace.id, { ...values, memberIds }),
            (c) => navigate(`/w/${workspace.id}/c/${c.id}`),
          ),
        )}
      >
        {error && <Alert tone="error">{error}</Alert>}
        <Field label={t('channel.name')} error={fieldError('name', formState.errors.name)}>
          {(p) => (
            <Input
              {...p}
              {...register('name')}
              placeholder={t('channel.namePlaceholder')}
              autoFocus
            />
          )}
        </Field>
        <Field label={`${t('channel.description')} (${t('common.optional')})`}>
          {(p) => <Input {...p} {...register('description')} />}
        </Field>
        <label className="flex items-start gap-2.5">
          <input
            type="checkbox"
            {...register('isPrivate')}
            className="mt-1 size-4 accent-[var(--accent)]"
          />
          <span>
            <span className="block font-semibold">{t('channel.private')}</span>
            <span className="block text-sm text-muted">{t('channel.privateHelp')}</span>
          </span>
        </label>
        {isPrivate && (
          <MemberPicker
            label={t('channel.members')}
            members={others}
            value={memberIds}
            onChange={setMemberIds}
          />
        )}
        <div className="flex justify-end">
          <Button type="submit" busy={formState.isSubmitting}>
            {t('channel.create.submit')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
