import type { ShouldRevalidateFunctionArgs } from 'react-router';
import { toChannelVM } from '../../../shared/mappers/channel.mapper';
import { toPersonVM } from '../../../shared/mappers/person.mapper';
import { fetchMe } from '../../../shared/servers/session.service';
import { toMessagePageVM } from '../mappers/message.mapper';
import {
  fetchChannel,
  fetchChannelMembers,
  fetchMessages,
  fetchWorkspaceRole,
} from './channel.service';

export async function channelLoader({
  params,
}: {
  params: { workspaceId?: string; channelId?: string };
}) {
  const workspaceId = params.workspaceId ?? '';
  const channelId = params.channelId ?? '';
  const [channel, page, members, me, role] = await Promise.all([
    fetchChannel(workspaceId, channelId),
    fetchMessages(workspaceId, channelId),
    fetchChannelMembers(workspaceId, channelId),
    fetchMe(),
    fetchWorkspaceRole(workspaceId),
  ]);
  const viewer = { meId: me?.id ?? '', canModerate: role === 'owner' || role === 'admin' };
  return {
    channel: toChannelVM(channel),
    page: toMessagePageVM(page, viewer),
    members: members.items.map(toPersonVM),
    viewer,
  };
}

export function channelShouldRevalidate({
  currentParams,
  nextParams,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  if (currentParams.channelId !== nextParams.channelId) return true;
  return defaultShouldRevalidate;
}
