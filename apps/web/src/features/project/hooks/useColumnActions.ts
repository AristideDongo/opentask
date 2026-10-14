import type { UpdateColumnInput } from '@opentask/contracts/projects/column';
import { useRevalidator } from 'react-router';
import { useI18n } from '../../../shared/hooks/useI18n';
import { useToast } from '../../../shared/hooks/useToast';
import { useWorkspaceData } from '../../../shared/hooks/useWorkspaceData';
import { createColumn, deleteColumn, updateColumn } from '../servers/project.service';

export function useColumnActions(projectId: string) {
  const { workspace } = useWorkspaceData();
  const revalidator = useRevalidator();
  const { notify } = useToast();
  const { errorMessage } = useI18n();

  const run = async (request: () => Promise<unknown>) => {
    try {
      await request();
      await revalidator.revalidate();
      return true;
    } catch (e) {
      notify(errorMessage(e));
      return false;
    }
  };

  return {
    create: (name: string) => run(() => createColumn(workspace.id, projectId, { name })),
    update: (columnId: string, input: UpdateColumnInput) =>
      run(() => updateColumn(workspace.id, projectId, columnId, input)),
    remove: (columnId: string, moveTasksTo: string | null) =>
      run(() => deleteColumn(workspace.id, projectId, columnId, { moveTasksTo })),
  };
}
