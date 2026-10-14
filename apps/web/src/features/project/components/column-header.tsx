import { clsx } from 'clsx';
import { useState } from 'react';
import { Input } from '../../../shared/components/form-controls';
import { TaskStatusIcon } from '../../../shared/components/task-status-icon';
import { useI18n } from '../../../shared/hooks/useI18n';
import type { ColumnVM } from '../../../shared/types/project.types';
import { useColumnActions } from '../hooks/useColumnActions';
import { ColumnMenu } from './column-menu';
import { DeleteColumnDialog } from './delete-column-dialog';

export function ColumnHeader({
  projectId,
  column,
  columns,
  index,
  count,
  editable,
}: {
  projectId: string;
  column: ColumnVM;
  columns: ColumnVM[];
  index: number;
  count: number;
  editable: boolean;
}) {
  const { t } = useI18n();
  const actions = useColumnActions(projectId);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(column.name);
  const [deleting, setDeleting] = useState(false);

  const startEditing = () => {
    if (!editable) return;
    setName(column.name);
    setEditing(true);
  };
  const commit = async () => {
    const next = name.trim();
    setEditing(false);
    if (next && next !== column.name) await actions.update(column.id, { name: next });
  };

  return (
    <div className="flex items-center gap-1.5 px-1 pt-0.5 pb-2">
      <TaskStatusIcon status={column.category} />
      {editing ? (
        <form
          className="flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            void commit();
          }}
        >
          <label htmlFor={`column-${column.id}`} className="sr-only">
            {t('column.name')}
          </label>
          <Input
            id={`column-${column.id}`}
            value={name}
            autoFocus
            maxLength={40}
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => void commit()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                setEditing(false);
              }
            }}
            className="h-8 text-sm font-semibold"
          />
        </form>
      ) : (
        <h2
          onDoubleClick={startEditing}
          title={editable ? t('column.renameHint') : undefined}
          className={clsx(
            'min-w-0 flex-1 truncate text-sm font-semibold',
            editable && 'cursor-text',
          )}
        >
          {column.name} <span className="font-normal text-muted">{count}</span>
        </h2>
      )}
      {editable && !editing && (
        <ColumnMenu
          column={column}
          canMoveLeft={index > 0}
          canMoveRight={index < columns.length - 1}
          onRename={startEditing}
          onCategoryChange={(category) => void actions.update(column.id, { category })}
          onMoveLeft={() =>
            void actions.update(column.id, { beforeColumnId: columns[index - 1]?.id ?? null })
          }
          onMoveRight={() =>
            void actions.update(column.id, { beforeColumnId: columns[index + 2]?.id ?? null })
          }
          onDelete={() => setDeleting(true)}
        />
      )}
      {deleting && (
        <DeleteColumnDialog
          column={column}
          count={count}
          columns={columns}
          onDelete={(moveTasksTo) => actions.remove(column.id, moveTasksTo)}
          onClose={() => setDeleting(false)}
        />
      )}
    </div>
  );
}
