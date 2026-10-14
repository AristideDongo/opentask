import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { TaskStatusIcon } from '../../../shared/components/task-status-icon';
import { useI18n } from '../../../shared/hooks/useI18n';
import type { TaskDetailVM } from '../../../shared/types/task.types';

export function TitleField({
  task,
  disabled,
  onSave,
}: {
  task: TaskDetailVM;
  disabled: boolean;
  onSave(title: string): void;
}) {
  const { t } = useI18n();
  const [title, setTitle] = useState(task.title);
  const commit = () => {
    const next = title.trim();
    if (next && next !== task.title) onSave(next);
    else setTitle(task.title);
  };
  return (
    <div className="flex items-start gap-2">
      <TaskStatusIcon status={task.status} className="mt-2.5 size-5 shrink-0" />
      <Dialog.Title asChild>
        <h2 className="w-full">
          <label htmlFor="task-title" className="sr-only">
            {t('task.title')}
          </label>
          <textarea
            id="task-title"
            value={title}
            disabled={disabled}
            rows={1}
            maxLength={200}
            onChange={(e) => setTitle(e.target.value.replace(/\n/g, ''))}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
            className="field-sizing-content block w-full resize-none rounded-[var(--radius-control)] border border-transparent bg-transparent px-1.5 py-1 text-xl leading-snug font-bold hover:border-line focus-visible:border-accent disabled:hover:border-transparent"
          />
        </h2>
      </Dialog.Title>
    </div>
  );
}
