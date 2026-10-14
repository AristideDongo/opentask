import { useI18n } from '../../../shared/hooks/useI18n';
import type { ColumnVM } from '../../../shared/types/project.types';
import type { TaskVM } from '../../../shared/types/task.types';

export function ColumnSelect({
  task,
  columns,
  disabled,
  onChange,
}: {
  task: Pick<TaskVM, 'title' | 'column'>;
  columns: ColumnVM[];
  disabled: boolean;
  onChange(columnId: string): void;
}) {
  const { t } = useI18n();
  return (
    <select
      aria-label={t('column.of', { title: task.title })}
      value={task.column.id}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 max-w-full rounded-[var(--radius-control)] border border-transparent bg-transparent px-1.5 text-sm hover:border-line disabled:opacity-100"
    >
      {columns.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
