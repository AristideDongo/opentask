import { Hash, Lock } from 'lucide-react';
import { useI18n } from '../../../shared/hooks/useI18n';
import type { ChannelVM } from '../../../shared/types/channel.types';
import type { PersonVM } from '../../../shared/types/person.types';
import { ChannelMembersDialog } from './channel-members-dialog';
import { ChannelSettingsDialog } from './channel-settings-dialog';

export function ChannelHeader({
  channel,
  members,
  meId,
}: {
  channel: ChannelVM;
  members: PersonVM[];
  meId: string;
}) {
  const { t } = useI18n();
  const Icon = channel.isPrivate ? Lock : Hash;
  return (
    <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3 sm:px-6">
      <Icon aria-hidden className="size-5 shrink-0 text-muted" />
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-bold">{channel.name}</h1>
        <p className="truncate text-sm text-muted">
          {channel.description ||
            (channel.isPrivate
              ? t('channel.membersCount', { count: members.length })
              : t('channel.public'))}
        </p>
      </div>
      <ChannelMembersDialog channel={channel} members={members} meId={meId} />
      {channel.canManage && <ChannelSettingsDialog channel={channel} />}
    </header>
  );
}
