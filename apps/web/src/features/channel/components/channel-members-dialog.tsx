import { Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useRevalidator } from 'react-router';
import { Alert } from '../../../shared/components/alert';
import { Avatar } from '../../../shared/components/avatar';
import { Button } from '../../../shared/components/button';
import { Field, Select } from '../../../shared/components/form-controls';
import { Modal } from '../../../shared/components/modal';
import { useI18n } from '../../../shared/hooks/useI18n';
import { useWorkspaceData } from '../../../shared/hooks/useWorkspaceData';
import type { ChannelVM } from '../../../shared/types/channel.types';
import type { PersonVM } from '../../../shared/types/person.types';
import { channelAudienceSize } from '../mappers/channel-audience.mapper';
import { addChannelMember, removeChannelMember } from '../servers/channel.service';

export function ChannelMembersDialog({
  channel,
  members,
  meId,
}: {
  channel: ChannelVM;
  members: PersonVM[];
  meId: string;
}) {
  const { workspace, members: workspaceMembers } = useWorkspaceData();
  const { t, errorMessage } = useI18n();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [open, setOpen] = useState(false);
  const [toAdd, setToAdd] = useState('');
  const [error, setError] = useState<string | null>(null);
  const candidates = workspaceMembers.filter((m) => !members.some((x) => x.id === m.id));
  const canAdd = workspace.role !== 'guest';

  const run = async (request: () => Promise<unknown>) => {
    setError(null);
    try {
      await request();
      await revalidator.revalidate();
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      title={t('channel.members')}
      trigger={
        <Button variant="secondary" size="sm">
          <Users aria-hidden className="size-4" />
          {channelAudienceSize(channel, members, workspaceMembers)}
          <span className="sr-only">{t('channel.members')}</span>
        </Button>
      }
    >
      <div className="space-y-4">
        {!channel.isPrivate && <p className="text-sm text-muted">{t('channel.public')}</p>}
        {error && <Alert tone="error">{error}</Alert>}
        <ul className="divide-y divide-line">
          {members.map((m) => (
            <li key={m.id} className="flex items-center gap-2.5 py-2">
              <Avatar initials={m.initials} size="sm" />
              <span className="flex-1 text-sm">{m.name}</span>
              {m.id === meId ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    run(async () => {
                      await removeChannelMember(workspace.id, channel.id, m.id);
                      setOpen(false);
                      if (channel.isPrivate) navigate(`/w/${workspace.id}`);
                    })
                  }
                >
                  {t('channel.leave')}
                </Button>
              ) : (
                channel.canManage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => run(() => removeChannelMember(workspace.id, channel.id, m.id))}
                  >
                    {t('channel.remove')}
                  </Button>
                )
              )}
            </li>
          ))}
        </ul>
        {canAdd && candidates.length > 0 && (
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (toAdd)
                void run(async () => {
                  await addChannelMember(workspace.id, channel.id, toAdd);
                  setToAdd('');
                });
            }}
          >
            <div className="flex-1">
              <Field label={t('channel.addMember')}>
                {(p) => (
                  <Select {...p} value={toAdd} onChange={(e) => setToAdd(e.target.value)}>
                    <option value="">{t('channel.choosePerson')}</option>
                    {candidates.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            </div>
            <Button type="submit" disabled={!toAdd}>
              {t('task.add')}
            </Button>
          </form>
        )}
      </div>
    </Modal>
  );
}
