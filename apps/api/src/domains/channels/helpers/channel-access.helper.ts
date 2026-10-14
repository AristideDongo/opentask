import { isAtLeast, type WorkspaceRole } from '@opentask/contracts/workspaces/roles';
import { ForbiddenActionError } from '../../workspaces/errors/workspace.errors';
import {
  ChannelManagementForbiddenError,
  ChannelNotFoundError,
  MessageDeleteForbiddenError,
  MessageDeletedError,
  MessageEditForbiddenError,
} from '../errors/channel.errors';
import type {
  ChannelAccessFacts,
  ChannelActor,
  ChannelAudience,
  MessageFacts,
} from '../types/channel.types';

export function canAccessChannel(
  role: WorkspaceRole,
  channel: Omit<ChannelAccessFacts, 'createdById'>,
): boolean {
  return channel.isChannelMember || (!channel.isPrivate && isAtLeast(role, 'member'));
}

export function assertCanAccessChannel<T extends Omit<ChannelAccessFacts, 'createdById'>>(
  role: WorkspaceRole,
  channel: T | null,
): asserts channel is T {
  if (!channel || !canAccessChannel(role, channel)) throw new ChannelNotFoundError();
}

export function canManageChannel(actor: ChannelActor, channel: ChannelAccessFacts): boolean {
  return (
    canAccessChannel(actor.role, channel) &&
    (channel.createdById === actor.userId || isAtLeast(actor.role, 'admin'))
  );
}

export function assertCanManageChannel(actor: ChannelActor, channel: ChannelAccessFacts): void {
  if (!canManageChannel(actor, channel)) throw new ChannelManagementForbiddenError();
}

export function assertCanAddChannelMember(role: WorkspaceRole): void {
  if (!isAtLeast(role, 'member')) throw new ForbiddenActionError();
}

export function assertCanEditMessage(actorId: string, message: MessageFacts): void {
  if (message.deletedAt) throw new MessageDeletedError();
  if (message.authorId !== actorId) throw new MessageEditForbiddenError();
}

export function assertCanDeleteMessage(actor: ChannelActor, message: MessageFacts): void {
  if (message.deletedAt) throw new MessageDeletedError();
  if (message.authorId !== actor.userId && !isAtLeast(actor.role, 'admin'))
    throw new MessageDeleteForbiddenError();
}

export function channelAudience(isPrivate: boolean, memberIds: string[]): ChannelAudience {
  return isPrivate ? { userIds: memberIds } : { minRole: 'member', userIds: memberIds };
}
