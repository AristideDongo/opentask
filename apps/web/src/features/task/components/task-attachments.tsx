import { clsx } from 'clsx';
import { LoaderCircle } from 'lucide-react';
import { useState, type DragEvent } from 'react';
import { useRevalidator } from 'react-router';
import { Alert } from '../../../shared/components/alert';
import { AttachmentList } from '../../../shared/components/attachment-list';
import { FilePickerButton } from '../../../shared/components/file-picker-button';
import { useI18n } from '../../../shared/hooks/useI18n';
import { useToast } from '../../../shared/hooks/useToast';
import { useWorkspaceData } from '../../../shared/hooks/useWorkspaceData';
import type { AttachmentVM } from '../../../shared/types/content.types';
import type { TaskDetailVM } from '../../../shared/types/task.types';
import { deleteAttachment, uploadTaskAttachment } from '../servers/task.service';

export function TaskAttachments({ task, canWrite }: { task: TaskDetailVM; canWrite: boolean }) {
  const { workspace } = useWorkspaceData();
  const { t, errorMessage } = useI18n();
  const { notify } = useToast();
  const revalidator = useRevalidator();
  const [uploading, setUploading] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);

  const upload = async (files: File[]) => {
    setErrors([]);
    const failed: string[] = [];
    for (const file of files) {
      setUploading(file.name);
      try {
        await uploadTaskAttachment(workspace.id, task.id, file);
      } catch (e) {
        failed.push(t('files.failed', { name: file.name, reason: errorMessage(e) }));
      }
    }
    setUploading(null);
    setErrors(failed);
    await revalidator.revalidate();
  };

  const remove = async (attachment: AttachmentVM) => {
    if (!window.confirm(t('files.deleteConfirm', { name: attachment.fileName }))) return;
    try {
      await deleteAttachment(workspace.id, attachment.id);
      notify(t('files.deleted'));
      await revalidator.revalidate();
    } catch (e) {
      notify(errorMessage(e));
    }
  };

  const onDrop = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length && !uploading) void upload(files);
  };

  return (
    <section
      aria-labelledby="task-files-title"
      className={clsx(
        'rounded-[var(--radius-panel)]',
        dragging && 'outline-2 outline-offset-4 outline-accent outline-dashed',
      )}
      onDragOver={
        canWrite
          ? (e) => {
              if (!e.dataTransfer.types.includes('Files')) return;
              e.preventDefault();
              setDragging(true);
            }
          : undefined
      }
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false);
      }}
      onDrop={canWrite ? onDrop : undefined}
    >
      <div className="mb-2 flex items-center gap-2">
        <h3 id="task-files-title" className="text-sm font-semibold">
          {t('files.title')}
        </h3>
        {canWrite && (
          <FilePickerButton
            label={t('files.attach')}
            showLabel
            disabled={uploading !== null}
            onFiles={(files) => void upload(files)}
            className="ml-auto inline-flex h-8 items-center rounded-[var(--radius-control)] px-2 text-sm text-muted hover:bg-sunken hover:text-ink disabled:opacity-50"
          />
        )}
      </div>
      {uploading && (
        <p role="status" className="mb-2 flex items-center gap-2 text-sm text-muted">
          <LoaderCircle aria-hidden className="size-4 animate-spin" />
          {t('files.uploading', { name: uploading })}
        </p>
      )}
      {errors.map((message) => (
        <div key={message} className="mb-2">
          <Alert tone="error">{message}</Alert>
        </div>
      ))}
      {task.attachments.length === 0 ? (
        <p className="text-sm text-muted">{canWrite ? t('files.dropHint') : t('files.empty')}</p>
      ) : (
        <AttachmentList attachments={task.attachments} onDelete={(a) => void remove(a)} />
      )}
    </section>
  );
}
