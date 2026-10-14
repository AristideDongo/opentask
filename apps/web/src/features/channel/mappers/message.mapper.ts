import type { Message, MessagePage } from '@opentask/contracts/channels/message';
import { toMessageVM } from '../../../shared/mappers/channel.mapper';
import { COMPACT_WINDOW_MS } from '../channel.const';
import type {
  ChannelMessageVM,
  MessagePageVM,
  MessageRowVM,
  MessageViewer,
} from '../channel.types';

export function toChannelMessageVM(message: Message, viewer: MessageViewer): ChannelMessageVM {
  const vm = toMessageVM(message, viewer.meId);
  return {
    ...vm,
    canEdit: !vm.isDeleted && vm.isMine,
    canDelete: !vm.isDeleted && (vm.isMine || viewer.canModerate),
  };
}

export const toMessagePageVM = (page: MessagePage, viewer: MessageViewer): MessagePageVM => ({
  messages: page.items.map((m) => toChannelMessageVM(m, viewer)),
  nextCursor: page.nextCursor ?? null,
});

const byDateThenId = (a: ChannelMessageVM, b: ChannelMessageVM) =>
  a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : a.id < b.id ? -1 : 1;

export function mergeMessages(current: ChannelMessageVM[], incoming: ChannelMessageVM[]) {
  const byId = new Map(current.map((m) => [m.id, m]));
  for (const m of incoming) byId.set(m.id, m);
  return [...byId.values()].sort(byDateThenId);
}

export function toMessageRows(messages: ChannelMessageVM[]): MessageRowVM[] {
  return messages.map((message, i) => {
    const prev = messages[i - 1];
    const showDay = !prev || prev.createdAt.slice(0, 10) !== message.createdAt.slice(0, 10);
    const compact =
      !showDay &&
      prev !== undefined &&
      prev.author?.id === message.author?.id &&
      new Date(message.createdAt).getTime() - new Date(prev.createdAt).getTime() <
        COMPACT_WINDOW_MS;
    return { message, showDay, compact };
  });
}
