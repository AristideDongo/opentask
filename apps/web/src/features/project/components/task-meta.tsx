import { CheckSquare, MessageSquare } from 'lucide-react';
import type { TaskVM } from '../../../shared/types/task.types';

export function TaskMeta({ task }: { task: Pick<TaskVM, 'subtasks' | 'commentCount'> }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-2 text-xs text-muted">
      {task.subtasks && (
        <span className="inline-flex items-center gap-1">
          <CheckSquare aria-hidden className="size-3.5" />
          {task.subtasks.done}/{task.subtasks.total}
        </span>
      )}
      {task.commentCount > 0 && (
        <span className="inline-flex items-center gap-1">
          <MessageSquare aria-hidden className="size-3.5" />
          {task.commentCount}
        </span>
      )}
    </span>
  );
}
