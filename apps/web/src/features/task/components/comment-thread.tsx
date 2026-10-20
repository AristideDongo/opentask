import { useState } from 'react';
import { useRevalidator } from 'react-router';
import { Alert } from '../../../shared/components/alert';
import { Avatar } from '../../../shared/components/avatar';
import { Button } from '../../../shared/components/button';
import { MentionTextarea } from '../../../shared/components/mention-textarea';
import { RichText } from '../../../shared/components/rich-text';
import { useI18n } from '../../../shared/hooks/useI18n';
import { useWorkspaceData } from '../../../shared/hooks/useWorkspaceData';
import { toMentionMarkup } from '../../../shared/mappers/content.mapper';
import type { MentionRefVM } from '../../../shared/types/content.types';
import type { TaskDetailVM } from '../../../shared/types/task.types';
import { commentTask } from '../servers/task.service';
import { TEXTAREA_CLASS } from '../task.const';

export function CommentThread({ task }: { task: TaskDetailVM }) {
  const { workspace, members } = useWorkspaceData();
  const candidates = members
    .filter((m) => !m.isMe)
    .map((m) => ({ id: m.id, name: m.name, initials: m.initials }));
  const { t, formatDate, errorMessage } = useI18n();
  const revalidator = useRevalidator();
  const [body, setBody] = useState('');
  const [picked, setPicked] = useState<MentionRefVM[]>([]);
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
                <RichText segments={c.segments} className="text-[0.9375rem]" />
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
            await commentTask(workspace.id, task.id, toMentionMarkup(body.trim(), picked));
            setBody('');
            setPicked([]);
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
        <MentionTextarea
          id="task-comment"
          value={body}
          onValueChange={setBody}
          candidates={candidates}
          picked={picked}
          onPickedChange={setPicked}
          aria-describedby="task-comment-hint"
          rows={2}
          maxLength={4000}
          placeholder={t('task.commentPlaceholder')}
          className={TEXTAREA_CLASS}
        />
        {error && <Alert tone="error">{error}</Alert>}
        <div className="flex items-center justify-between gap-3">
          <p id="task-comment-hint" className="text-xs text-muted">
            {t('mention.hint')}
          </p>
          <Button type="submit" size="sm" busy={busy} disabled={!body.trim()}>
            {t('task.comment')}
          </Button>
        </div>
      </form>
    </section>
  );
}
