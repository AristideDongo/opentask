import type { ChannelVM } from '../../../shared/types/channel.types';
import type { PersonVM } from '../../../shared/types/person.types';
import type { MemberVM } from '../../../shared/types/workspace.types';
import type { MentionCandidateVM } from '../channel.types';

export function toMentionCandidates(
  channel: Pick<ChannelVM, 'isPrivate'>,
  channelMembers: PersonVM[],
  workspaceMembers: MemberVM[],
  meId: string,
): MentionCandidateVM[] {
  const inChannel = new Set(channelMembers.map((m) => m.id));
  return workspaceMembers
    .filter(
      (m) => m.id !== meId && (inChannel.has(m.id) || (!channel.isPrivate && m.role !== 'guest')),
    )
    .map((m) => ({ id: m.id, name: m.name, initials: m.initials }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
