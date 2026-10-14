import { useState } from 'react';
import { useRevalidator } from 'react-router';
import { Alert } from '../../../shared/components/alert';
import { Avatar } from '../../../shared/components/avatar';
import { Button } from '../../../shared/components/button';
import { useI18n } from '../../../shared/hooks/useI18n';
import { useWorkspaceData } from '../../../shared/hooks/useWorkspaceData';
import type { TaskDetailVM } from '../../../shared/types/task.types';
import { commentTask } from '../servers/task.service';
import { TEXTAREA_CLASS } from '../task.const';

export function CommentThread({ task }: { task: TaskDetailVM }) {
  const { workspace } = useWorkspaceData();
  const { t, formatDate, errorMessage } = useI18n();
  const revalidator = useRevalidator();
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold">{t('task.comments')}</h3>
      {task.comments.length === 0 ? (
        <p className="mb-3 text-sm text-muted">{t('task.noComments')}</p>
      ) : (
        <ol className="mb-4 space-y-3">
          {task.comments.map((c) => (
            <li key={c.id} className="flex gap-2.5">
              <Avatar initials={c.author?.initials ?? '?'} size="sm" />
              <div className="min-w-0">
                <p className="text-sm">
                  <span className="font-semibold">{c.author?.name ?? t('audit.someone')}</span>{' '}
                  <time dateTime={c.createdAt} className="text-xs text-muted">
                    {formatDate(c.createdAt)}
                  </time>
                </p>
                <p className="text-[0.9375rem] break-words whitespace-pre-wrap">{c.body}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!body.trim()) return;
          setBusy(true);
          setError(null);
          try {
            await commentTask(workspace.id, task.id, body);
            setBody('');
            await revalidator.revalidate();
          } catch (err) {
            setError(errorMessage(err));
          } finally {
            setBusy(false);
          }
        }}
        className="space-y-2"
      >
        <label htmlFor="task-comment" className="sr-only">
          {t('task.commentPlaceholder')}
        </label>
        <textarea
          id="task-comment"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          maxLength={4000}
          placeholder={t('task.commentPlaceholder')}
          className={TEXTAREA_CLASS}
        />
        {error && <Alert tone="error">{error}</Alert>}
        <div className="flex justify-end">
          <Button type="submit" size="sm" busy={busy} disabled={!body.trim()}>
            {t('task.comment')}
          </Button>
        </div>
      </form>
    </section>
  );
}
