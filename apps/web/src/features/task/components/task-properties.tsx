import type { UpdateTaskInput } from '@opentask/contracts/tasks/task';
import { TASK_PRIORITIES, type TaskPriority } from '@opentask/contracts/tasks/status';
import { Input, Select } from '../../../shared/components/form-controls';
import { LabelPicker } from '../../../shared/components/label-picker';
import { useI18n } from '../../../shared/hooks/useI18n';
import { useWorkspaceData } from '../../../shared/hooks/useWorkspaceData';
import type { ColumnVM, LabelVM } from '../../../shared/types/project.types';
import type { TaskDetailVM } from '../../../shared/types/task.types';
import { PropertyRow } from './property-row';

export function TaskProperties({
  task,
  columns,
  labels,
  disabled,
  onSave,
}: {
  task: TaskDetailVM;
  columns: ColumnVM[];
  labels: LabelVM[];
  disabled: boolean;
  onSave(patch: UpdateTaskInput): void;
}) {
  const { t } = useI18n();
  const { members } = useWorkspaceData();
  return (
    <dl className="grid grid-cols-[8rem_minmax(0,1fr)] items-center gap-x-4 gap-y-2 text-sm">
      <PropertyRow label={t('task.status')} id="task-status">
        <Select
          id="task-status"
          value={task.column.id}
          disabled={disabled}
          onChange={(e) => onSave({ columnId: e.target.value })}
          className="h-9 text-sm"
        >
          {columns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </PropertyRow>
      <PropertyRow label={t('task.priority')} id="task-priority">
        <Select
          id="task-priority"
          value={task.priority}
          disabled={disabled}
          onChange={(e) => onSave({ priority: e.target.value as TaskPriority })}
          className="h-9 text-sm"
        >
          {TASK_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {t(`priority.${p}`)}
            </option>
          ))}
        </Select>
      </PropertyRow>
      <PropertyRow label={t('task.assignee')} id="task-assignee">
        <Select
          id="task-assignee"
          value={task.assignee?.id ?? ''}
          disabled={disabled}
          onChange={(e) => onSave({ assigneeId: e.target.value || null })}
          className="h-9 text-sm"
        >
          <option value="">{t('task.unassigned')}</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </Select>
      </PropertyRow>
      <PropertyRow label={t('task.dueDate')} id="task-due">
        <Input
          id="task-due"
          type="date"
          value={task.dueDate ?? ''}
          disabled={disabled}
          onChange={(e) => onSave({ dueDate: e.target.value || null })}
          className="h-9 text-sm"
        />
      </PropertyRow>
      <dt className="self-start pt-1 text-muted">{t('task.labels')}</dt>
      <dd>
        <LabelPicker
          labels={labels}
          value={task.labels.map((l) => l.id)}
          disabled={disabled}
          onChange={(labelIds) => onSave({ labelIds })}
        />
      </dd>
    </dl>
  );
}
