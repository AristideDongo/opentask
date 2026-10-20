import type { RealtimeEvent } from '@opentask/contracts/realtime/event';

type MentionEvent = Extract<RealtimeEvent, { type: 'mention.created' }>;

export type MentionNoticeVM =
  | { key: 'mention.inMessage'; params: { name: string; channel: string }; to: string }
  | { key: 'mention.inComment'; params: { name: string; task: string }; to: string };

export function toMentionNotice(
  event: MentionEvent,
  workspaceId: string,
  currentPath: string,
): MentionNoticeVM | null {
  const notice: MentionNoticeVM =
    event.target.kind === 'message'
      ? {
          key: 'mention.inMessage',
          params: { name: event.by.name, channel: event.target.channelName },
          to: `/w/${workspaceId}/c/${event.target.channelId}`,
        }
      : {
          key: 'mention.inComment',
          params: { name: event.by.name, task: event.target.taskTitle },
          to: `/w/${workspaceId}/p/${event.target.projectId}/t/${event.target.taskId}`,
        };
  return currentPath === notice.to ? null : notice;
}
