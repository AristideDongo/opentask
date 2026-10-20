import { z } from 'zod';
import { MessageSchema } from '../channels/message';
import { IdSchema, RefSchema } from '../common/primitives';
import { TaskCommentSchema } from '../tasks/comment';

export const RealtimeEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('message.created'), message: MessageSchema }),
  z.object({ type: z.literal('message.updated'), message: MessageSchema }),
  z.object({ type: z.literal('message.deleted'), message: MessageSchema }),
  z.object({ type: z.literal('channel.changed'), channelId: IdSchema }),
  z.object({ type: z.literal('channel.deleted'), channelId: IdSchema }),
  z.object({ type: z.literal('task.changed'), projectId: IdSchema, taskId: IdSchema }),
  z.object({ type: z.literal('task.deleted'), projectId: IdSchema, taskId: IdSchema }),
  z.object({
    type: z.literal('task.commented'),
    projectId: IdSchema,
    taskId: IdSchema,
    comment: TaskCommentSchema,
  }),
  z.object({ type: z.literal('project.changed'), projectId: IdSchema }),
  z.object({ type: z.literal('team.changed'), teamId: IdSchema }),
  z.object({ type: z.literal('members.changed') }),
  z.object({
    type: z.literal('mention.created'),
    by: RefSchema,
    excerpt: z.string(),
    target: z.discriminatedUnion('kind', [
      z.object({
        kind: z.literal('message'),
        channelId: IdSchema,
        channelName: z.string(),
        messageId: IdSchema,
      }),
      z.object({
        kind: z.literal('comment'),
        projectId: IdSchema,
        taskId: IdSchema,
        taskTitle: z.string(),
      }),
    ]),
  }),
]);
export type RealtimeEvent = z.infer<typeof RealtimeEventSchema>;
export type RealtimeEventType = RealtimeEvent['type'];

export const REALTIME_EVENT_TYPES = RealtimeEventSchema.options.map((o) => o.shape.type.value);
