import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Link, useLoaderData, useLocation, useNavigate, useParams } from 'react-router';
import { Alert } from '../../shared/components/alert';
import { useI18n } from '../../shared/hooks/useI18n';
import { useOptionalProjectData } from '../../shared/hooks/useProjectData';
import { useToast } from '../../shared/hooks/useToast';
import { useWorkspaceData } from '../../shared/hooks/useWorkspaceData';
import { CommentThread } from './components/comment-thread';
import { DescriptionField } from './components/description-field';
import { SubtaskList } from './components/subtask-list';
import { TaskAttachments } from './components/task-attachments';
import { TaskFooter } from './components/task-footer';
import { TaskProperties } from './components/task-properties';
import { TitleField } from './components/title-field';
import { useTaskSave } from './hooks/useTaskSave';
import { deleteTask } from './servers/task.service';
import { taskLoader } from './servers/task.loader';

export const clientLoader = taskLoader;

export default function TaskPanel() {
  const { task } = useLoaderData<typeof taskLoader>();
  const { workspace } = useWorkspaceData();
  const projectData = useOptionalProjectData();
  const { t } = useI18n();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams();
  const { save, error } = useTaskSave(task.id);
  const canWrite = workspace.permissions.canWriteTasks;
  const columns = projectData?.project.columns ?? [{ ...task.column, category: task.status }];
  const labels = projectData?.project.labels ?? task.labels;
  const close = () => navigate(`/w/${workspace.id}/p/${projectId}${location.search}`);

  return (
    <Dialog.Root open onOpenChange={(open) => !open && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/30" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col border-l border-line bg-surface shadow-2xl"
        >
          <div className="flex items-center gap-3 border-b border-line px-5 py-3 text-sm text-muted">
            <span className="truncate">{task.projectName}</span>
            {task.parentId && (
              <Link
                to={{ pathname: `../t/${task.parentId}`, search: location.search }}
                relative="path"
                className="truncate hover:text-ink"
              >
                ↑ {t('task.subtasks')}
              </Link>
            )}
            <Dialog.Close className="ml-auto rounded-[var(--radius-control)] p-1.5 hover:bg-sunken hover:text-ink">
              <X aria-hidden className="size-5" />
              <span className="sr-only">{t('task.close')}</span>
            </Dialog.Close>
          </div>
          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
            <TitleField
              key={`${task.id}-${task.updatedAt}`}
              task={task}
              disabled={!canWrite}
              onSave={(title) => void save({ title })}
            />
            {error && <Alert tone="error">{error}</Alert>}
            {!canWrite && <p className="text-sm text-muted">{t('task.readOnly')}</p>}
            <TaskProperties
              task={task}
              columns={columns}
              labels={labels}
              disabled={!canWrite}
              onSave={(patch) => void save(patch)}
            />
            <DescriptionField
              key={`${task.id}-d-${task.updatedAt}`}
              task={task}
              disabled={!canWrite}
              onSave={(description) => save({ description })}
            />
            {!task.parentId && (
              <SubtaskList
                task={task}
                canWrite={canWrite}
                onToggle={(subtaskId, done) =>
                  void save({ status: done ? 'done' : 'todo' }, subtaskId)
                }
              />
            )}
            <TaskAttachments task={task} canWrite={canWrite} />
            <CommentThread task={task} />
            <TaskFooter
              task={task}
              onDelete={async () => {
                await deleteTask(workspace.id, task.id);
                notify(t('task.deleted'));
                close();
              }}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
