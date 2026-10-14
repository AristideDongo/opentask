import type { RealtimeEvent } from '@opentask/contracts/realtime/event';

export const taskChangedEvents = (task: {
  id: string;
  projectId: string;
  parentId: string | null;
}): RealtimeEvent[] => [
  { type: 'task.changed', projectId: task.projectId, taskId: task.id },
  ...(task.parentId
    ? [{ type: 'task.changed' as const, projectId: task.projectId, taskId: task.parentId }]
    : []),
];
