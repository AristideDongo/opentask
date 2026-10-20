import { useState } from 'react';
import { useI18n } from '../../../shared/hooks/useI18n';
import { useWorkspaceData } from '../../../shared/hooks/useWorkspaceData';
import type { PendingUploadVM } from '../channel.types';
import { uploadAttachment } from '../servers/channel.service';

let sequence = 0;

export function usePendingUploads() {
  const { workspace } = useWorkspaceData();
  const { errorMessage } = useI18n();
  const [uploads, setUploads] = useState<PendingUploadVM[]>([]);

  const update = (key: string, patch: Partial<PendingUploadVM>) =>
    setUploads((current) => current.map((u) => (u.key === key ? { ...u, ...patch } : u)));

  const add = (files: File[]) => {
    for (const file of files) {
      const key = `upload-${++sequence}`;
      setUploads((current) => [
        ...current,
        { key, fileName: file.name, status: 'uploading', attachmentId: null, error: null },
      ]);
      uploadAttachment(workspace.id, file)
        .then((attachment) => update(key, { status: 'done', attachmentId: attachment.id }))
        .catch((error: unknown) => update(key, { status: 'error', error: errorMessage(error) }));
    }
  };

  return {
    uploads,
    add,
    remove: (key: string) => setUploads((current) => current.filter((u) => u.key !== key)),
    clear: () => setUploads([]),
    busy: uploads.some((u) => u.status === 'uploading'),
    readyIds: uploads.flatMap((u) =>
      u.status === 'done' && u.attachmentId ? [u.attachmentId] : [],
    ),
  };
}
