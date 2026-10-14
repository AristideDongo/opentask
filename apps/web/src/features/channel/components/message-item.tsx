import { clsx } from 'clsx';
import { useState } from 'react';
import { Avatar } from '../../../shared/components/avatar';
import { Button } from '../../../shared/components/button';
import { useI18n } from '../../../shared/hooks/useI18n';
import type { ChannelMessageVM } from '../channel.types';
import { MessageActions } from './message-actions';

export function MessageItem({
  message,
  compact,
  onEdit,
  onDelete,
}: {
  message: ChannelMessageVM;
  compact: boolean;
  onEdit(body: string): Promise<boolean>;
  onDelete(): void;
}) {
  const { t, formatDate } = useI18n();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.body);
  const time = formatDate(message.createdAt, { hour: '2-digit', minute: '2-digit' });

  const saveEdit = async () => {
    if (await onEdit(draft)) setEditing(false);
  };

  return (
    <div
      className={clsx(
        'group relative flex gap-3 rounded-[var(--radius-control)] px-2 hover:bg-sunken/70',
        compact ? 'py-0.5' : 'mt-2 py-1.5',
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
            <textarea
              id={`edit-${message.id}`}
              value={draft}
              autoFocus
              maxLength={4000}
              onChange={(e) => setDraft(e.target.value)}
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
          <p className="text-[0.9375rem] leading-relaxed break-words whitespace-pre-wrap">
            {message.body}
            {message.isEdited && (
              <span className="ml-1 text-xs text-muted">{t('channel.edited')}</span>
            )}
          </p>
        )}
      </div>
      {(message.canEdit || message.canDelete) && !editing && (
        <MessageActions
          message={message}
          onEdit={() => {
            setDraft(message.body);
            setEditing(true);
          }}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}
