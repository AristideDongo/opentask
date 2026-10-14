import { clsx } from 'clsx';
import { useState, type FormEvent } from 'react';
import { Link, useLocation, useRevalidator } from 'react-router';
import { Alert } from '../../../shared/components/alert';
import { Avatar } from '../../../shared/components/avatar';
import { Button } from '../../../shared/components/button';
import { Input } from '../../../shared/components/form-controls';
import { useI18n } from '../../../shared/hooks/useI18n';
import { useWorkspaceData } from '../../../shared/hooks/useWorkspaceData';
import { createTask } from '../../../shared/servers/task.service';
import type { TaskDetailVM } from '../../../shared/types/task.types';

export function SubtaskList({
  task,
  canWrite,
  onToggle,
}: {
  task: TaskDetailVM;
  canWrite: boolean;
  onToggle(subtaskId: string, done: boolean): void;
}) {
  const { workspace } = useWorkspaceData();
  const { t, errorMessage } = useI18n();
  const location = useLocation();
  const revalidator = useRevalidator();
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setError(null);
    try {
      await createTask(workspace.id, task.projectId, { title: title.trim(), parentId: task.id });
      setTitle('');
      await revalidator.revalidate();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold">
        {t('task.subtasks')}{' '}
        {task.subtasks && (
          <span className="font-normal text-muted">
            {task.subtasks.done}/{task.subtasks.total}
          </span>
        )}
      </h3>
      <ul className="divide-y divide-line rounded-[var(--radius-control)] border border-line empty:hidden">
        {task.subtaskList.map((sub) => (
          <li key={sub.id} className="flex items-center gap-2.5 px-3 py-2">
            <input
              type="checkbox"
              checked={sub.isDone}
              disabled={!canWrite}
              aria-label={t('task.markDone', { title: sub.title })}
              onChange={(e) => onToggle(sub.id, e.target.checked)}
              className="size-4 accent-[var(--accent)]"
            />
            <Link
              to={{ pathname: `../t/${sub.id}`, search: location.search }}
              relative="path"
              className={clsx(
                'flex-1 text-sm hover:underline',
                sub.isDone && 'text-muted line-through',
              )}
            >
              {sub.title}
            </Link>
            {sub.assignee && <Avatar initials={sub.assignee.initials} size="sm" />}
          </li>
        ))}
      </ul>
      {canWrite && (
        <form onSubmit={add} className="mt-2 flex gap-2">
          <label htmlFor="subtask-new" className="sr-only">
            {t('task.addSubtask')}
          </label>
          <Input
            id="subtask-new"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('task.addSubtask')}
            className="h-9 text-sm"
          />
          <Button type="submit" variant="secondary" size="sm" className="h-9">
            {t('task.add')}
          </Button>
        </form>
      )}
      {error && (
        <div className="mt-2">
          <Alert tone="error">{error}</Alert>
        </div>
      )}
    </section>
  );
}
