import { MoreHorizontal } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate, useRevalidator } from 'react-router';
import { Alert } from '../../../shared/components/alert';
import { Button } from '../../../shared/components/button';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog';
import { Field, Input } from '../../../shared/components/form-controls';
import { Modal } from '../../../shared/components/modal';
import { useI18n } from '../../../shared/hooks/useI18n';
import { useToast } from '../../../shared/hooks/useToast';
import { useWorkspaceData } from '../../../shared/hooks/useWorkspaceData';
import type { ChannelVM } from '../../../shared/types/channel.types';
import { deleteChannel, updateChannel } from '../servers/channel.service';

export function ChannelSettingsDialog({ channel }: { channel: ChannelVM }) {
  const { workspace } = useWorkspaceData();
  const { t, errorMessage } = useI18n();
  const { notify } = useToast();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(channel.name);
  const [description, setDescription] = useState(channel.description);
  const [error, setError] = useState<string | null>(null);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await updateChannel(workspace.id, channel.id, { name, description });
      await revalidator.revalidate();
      setOpen(false);
      notify(t('common.saved'));
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        setName(channel.name);
        setDescription(channel.description);
        setError(null);
      }}
      title={t('channel.manage')}
      trigger={
        <button
          type="button"
          className="rounded-[var(--radius-control)] border border-line p-1.5 text-muted hover:bg-sunken hover:text-ink"
        >
          <MoreHorizontal aria-hidden className="size-5" />
          <span className="sr-only">{t('channel.manage')}</span>
        </button>
      }
    >
      <form className="space-y-4" onSubmit={save}>
        {error && <Alert tone="error">{error}</Alert>}
        <Field label={t('channel.name')}>
          {(p) => <Input {...p} value={name} onChange={(e) => setName(e.target.value)} />}
        </Field>
        <Field label={t('channel.description')}>
          {(p) => (
            <Input {...p} value={description} onChange={(e) => setDescription(e.target.value)} />
          )}
        </Field>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ConfirmDialog
            trigger={
              <Button variant="ghost" className="text-danger">
                {t('channel.delete')}
              </Button>
            }
            title={t('channel.delete')}
            description={t('channel.deleteBody', { name: channel.name })}
            confirmLabel={t('channel.delete')}
            onConfirm={async () => {
              await deleteChannel(workspace.id, channel.id);
              notify(t('channel.deleted'));
              navigate(`/w/${workspace.id}`);
            }}
          />
          <Button type="submit">{t('common.save')}</Button>
        </div>
      </form>
    </Modal>
  );
}
