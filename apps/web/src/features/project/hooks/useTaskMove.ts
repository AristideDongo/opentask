import { useRevalidator } from 'react-router';
import { useI18n } from '../../../shared/hooks/useI18n';
import { useToast } from '../../../shared/hooks/useToast';
import { useWorkspaceData } from '../../../shared/hooks/useWorkspaceData';
import { updateTask } from '../../../shared/servers/task.service';
import type { ColumnVM } from '../../../shared/types/project.types';
import { placeTask, withColumn } from '../mappers/column-group.mapper';
import type { SetTasks, TaskPlacement } from '../project.types';

export function useTaskMove(setTasks: SetTasks, columns: ColumnVM[]) {
  const { workspace } = useWorkspaceData();
  const revalidator = useRevalidator();
  const { notify } = useToast();
  const { errorMessage } = useI18n();

  return async (taskId: string, placement: TaskPlacement) => {
    const column = columns.find((c) => c.id === placement.columnId);
    if (!column || placement.beforeTaskId === taskId) return;
    setTasks((list) => {
      const updated = list.map((task) => (task.id === taskId ? withColumn(task, column) : task));
      return placement.beforeTaskId === undefined
        ? updated
        : placeTask(updated, taskId, placement.beforeTaskId);
    });
    try {
      await updateTask(workspace.id, taskId, placement);
    } catch (e) {
      notify(errorMessage(e));
    }
    await revalidator.revalidate();
  };
}
