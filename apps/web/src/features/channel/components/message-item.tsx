import { clsx } from 'clsx';
import { useState } from 'react';
import { AttachmentList } from '../../../shared/components/attachment-list';
import { Avatar } from '../../../shared/components/avatar';
import { Button } from '../../../shared/components/button';
import { MentionTextarea } from '../../../shared/components/mention-textarea';
import { RichText } from '../../../shared/components/rich-text';
import { useI18n } from '../../../shared/hooks/useI18n';
import { fromMentionMarkup, toMentionMarkup } from '../../../shared/mappers/content.mapper';
import type { MentionRefVM } from '../../../shared/types/content.types';
import type { ChannelMessageVM, MentionCandidateVM } from '../channel.types';
import { MessageActions } from './message-actions';

export function MessageItem({
  message,
  compact,
  candidates,
  onEdit,
  onDelete,
}: {
  message: ChannelMessageVM;
  compact: boolean;
  candidates: MentionCandidateVM[];
  onEdit(body: string): Promise<boolean>;
  onDelete(): void;
}) {
  const { t, formatDate } = useI18n();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [picked, setPicked] = useState<MentionRefVM[]>([]);
  const time = formatDate(message.createdAt, { hour: '2-digit', minute: '2-digit' });

  const saveEdit = async () => {
    if (await onEdit(toMentionMarkup(draft.trim(), picked))) setEditing(false);
  };

  return (
    <div
      className={clsx(
        'group relative flex gap-3 rounded-[var(--radius-control)] px-2 hover:bg-sunken/70',
        compact ? 'py-0.5' : 'mt-2 py-1.5',
        message.mentionsMe && !message.isDeleted && 'bg-accent-soft/60',
      )}
    >
      <div className="w-9 shrink-0">
        {compact ? (
          <time
            dateTime={message.createdAt}
            className="invisible block pt-0.5 text-right text-[0.6875rem] text-muted group-hover:visible"
          >
            {time}
          </time>
        ) : (
          <Avatar initials={message.author?.initials ?? '?'} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        {!compact && (
          <p className="text-sm">
            <span className="font-bold">{message.author?.name ?? t('audit.someone')}</span>{' '}
            <time dateTime={message.createdAt} className="text-xs text-muted">
              {time}
            </time>
          </p>
        )}
        {message.isDeleted ? (
          <p className="text-[0.9375rem] text-muted italic">{t('channel.deletedMessage')}</p>
        ) : editing ? (
          <div className="space-y-2 py-1">
            <label htmlFor={`edit-${message.id}`} className="sr-only">
              {t('channel.edit')}
            </label>
            <MentionTextarea
              id={`edit-${message.id}`}
              value={draft}
              onValueChange={setDraft}
              candidates={candidates}
              picked={picked}
              onPickedChange={setPicked}
              autoFocus
              maxLength={4000}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setEditing(false);
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void saveEdit();
                }
              }}
              className="field-sizing-content block max-h-60 min-h-10 w-full rounded-[var(--radius-control)] border border-line bg-surface px-3 py-2 text-[0.9375rem]"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => void saveEdit()} disabled={!draft.trim()}>
                {t('channel.save')}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {message.segments.length > 0 && (
              <RichText segments={message.segments} className="text-[0.9375rem] leading-relaxed" />
            )}
            <AttachmentList attachments={message.attachments} imageClassName="max-h-64 max-w-xs" />
            {message.isEdited && <span className="text-xs text-muted">{t('channel.edited')}</span>}
          </>
        )}
      </div>
      {(message.canEdit || message.canDelete) && !editing && (
        <MessageActions
          message={message}
          onEdit={() => {
            const initial = fromMentionMarkup(message.body, message.mentions);
            setDraft(initial.text);
            setPicked(initial.picked);
            setEditing(true);
          }}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}
