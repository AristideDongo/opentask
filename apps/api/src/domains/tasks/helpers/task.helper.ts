import type { TaskStatus } from '@opentask/contracts/tasks/status';
import { NotWorkspaceMemberError } from '../../workspaces/errors/workspace.errors';
import {
  ForeignLabelError,
  InvalidParentError,
  ParentTaskNotFoundError,
} from '../errors/task.errors';
import type { TaskReferences, TaskValidationFacts } from '../types/task.types';

export function completionDate(
  previous: TaskStatus | null,
  next: TaskStatus,
  current: Date | null,
  now: Date,
): Date | null {
  if (next !== 'done') return null;
  return previous === 'done' && current ? current : now;
}

export function assertTaskReferencesAreValid(
  input: TaskReferences & { projectId: string },
  facts: TaskValidationFacts,
): string[] {
  if (input.parentId) {
    if (!facts.parent) throw new ParentTaskNotFoundError();
    if (facts.parent.projectId !== input.projectId) {
      throw new InvalidParentError(
        'Une sous-tâche doit appartenir au même projet que sa tâche parente.',
      );
    }
    if (facts.parent.parentId)
      throw new InvalidParentError('Une sous-tâche ne peut pas avoir elle-même de sous-tâches.');
  }
  if (input.assigneeId && !facts.assigneeIsMember) throw new NotWorkspaceMemberError();
  const labelIds = [...new Set(input.labelIds ?? [])];
  const existing = new Set(facts.existingLabelIds);
  if (labelIds.some((id) => !existing.has(id))) throw new ForeignLabelError();
  return labelIds;
}
