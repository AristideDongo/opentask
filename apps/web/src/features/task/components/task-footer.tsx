import { Button } from '../../../shared/components/button';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog';
import { useI18n } from '../../../shared/hooks/useI18n';
import type { TaskDetailVM } from '../../../shared/types/task.types';

export function TaskFooter({ task, onDelete }: { task: TaskDetailVM; onDelete(): Promise<void> }) {
  const { t, formatDate } = useI18n();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-xs text-muted">
      <span>
        {task.createdBy &&
          t('task.createdBy', { name: task.createdBy.name, date: formatDate(task.createdAt) })}
        {task.completedAt && (
          <span className="block">
            {t('task.completedAt', { date: formatDate(task.completedAt) })}
          </span>
        )}
      </span>
      {task.canDelete && (
        <ConfirmDialog
          trigger={
            <Button variant="ghost" size="sm" className="text-danger">
              {t('task.delete')}
            </Button>
          }
          title={t('task.delete')}
          description={t('task.deleteBody', { title: task.title })}
          confirmLabel={t('task.delete')}
          onConfirm={onDelete}
        />
      )}
    </div>
  );
}
