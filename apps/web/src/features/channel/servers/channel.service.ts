import type {
  Channel,
  ChannelMemberList,
  UpdateChannelInput,
} from '@opentask/contracts/channels/channel';
import type { Message, MessagePage } from '@opentask/contracts/channels/message';
import type { Workspace } from '@opentask/contracts/workspaces/workspace';
import { apiClient } from '../../../shared/utils/api-client';
import { MESSAGE_PAGE_SIZE } from '../channel.const';

const channelPath = (workspaceId: string, channelId: string) =>
  `/workspaces/${workspaceId}/channels/${channelId}`;

export const fetchChannel = (workspaceId: string, channelId: string) =>
  apiClient<Channel>(channelPath(workspaceId, channelId));

export function fetchMessages(workspaceId: string, channelId: string, cursor?: string) {
  const query = new URLSearchParams({ limit: String(MESSAGE_PAGE_SIZE) });
  if (cursor) query.set('cursor', cursor);
  return apiClient<MessagePage>(`${channelPath(workspaceId, channelId)}/messages?${query}`);
}

export const fetchChannelMembers = (workspaceId: string, channelId: string) =>
  apiClient<ChannelMemberList>(`${channelPath(workspaceId, channelId)}/members`);

export const markChannelRead = (workspaceId: string, channelId: string) =>
  apiClient<void>(`${channelPath(workspaceId, channelId)}/read`, { method: 'POST' });

export const sendMessage = (workspaceId: string, channelId: string, body: string) =>
  apiClient<Message>(`${channelPath(workspaceId, channelId)}/messages`, {
    method: 'POST',
    body: { body },
  });

export const editMessage = (
  workspaceId: string,
  channelId: string,
  messageId: string,
  body: string,
) =>
  apiClient<Message>(`${channelPath(workspaceId, channelId)}/messages/${messageId}`, {
    method: 'PATCH',
    body: { body },
  });

export const deleteMessage = (workspaceId: string, channelId: string, messageId: string) =>
  apiClient<void>(`${channelPath(workspaceId, channelId)}/messages/${messageId}`, {
    method: 'DELETE',
  });

export const addChannelMember = (workspaceId: string, channelId: string, userId: string) =>
  apiClient<void>(`${channelPath(workspaceId, channelId)}/members/${userId}`, { method: 'PUT' });

export const removeChannelMember = (workspaceId: string, channelId: string, userId: string) =>
  apiClient<void>(`${channelPath(workspaceId, channelId)}/members/${userId}`, { method: 'DELETE' });

export const updateChannel = (workspaceId: string, channelId: string, input: UpdateChannelInput) =>
  apiClient<Channel>(channelPath(workspaceId, channelId), { method: 'PATCH', body: input });

export const deleteChannel = (workspaceId: string, channelId: string) =>
  apiClient<void>(channelPath(workspaceId, channelId), { method: 'DELETE' });

export const fetchWorkspaceRole = async (workspaceId: string) =>
  (await apiClient<Workspace>(`/workspaces/${workspaceId}`)).myRole;
