import type { UpdateTaskInput } from '@opentask/contracts/tasks/task';
import { useState } from 'react';
import { useRevalidator } from 'react-router';
import { useI18n } from '../../../shared/hooks/useI18n';
import { useWorkspaceData } from '../../../shared/hooks/useWorkspaceData';
import { updateTask } from '../../../shared/servers/task.service';

export function useTaskSave(taskId: string) {
  const { workspace } = useWorkspaceData();
  const { errorMessage } = useI18n();
  const revalidator = useRevalidator();
  const [error, setError] = useState<string | null>(null);

  const save = async (patch: UpdateTaskInput, id = taskId) => {
    setError(null);
    try {
      await updateTask(workspace.id, id, patch);
      await revalidator.revalidate();
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  return { save, error };
}
