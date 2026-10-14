import type { ChannelVM } from '../../../shared/types/channel.types';
import type { PersonVM } from '../../../shared/types/person.types';
import type { MemberVM } from '../../../shared/types/workspace.types';

export function channelAudienceSize(
  channel: ChannelVM,
  members: PersonVM[],
  workspaceMembers: MemberVM[],
) {
  if (channel.isPrivate) return members.length;
  const nonGuests = workspaceMembers.filter((m) => m.role !== 'guest').map((m) => m.id);
  return new Set([...nonGuests, ...members.map((m) => m.id)]).size;
}
