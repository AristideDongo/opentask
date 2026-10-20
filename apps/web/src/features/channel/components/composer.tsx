import { clsx } from 'clsx';
import { SendHorizontal } from 'lucide-react';
import { useEffect, useRef, useState, type DragEvent, type KeyboardEvent } from 'react';
import { Alert } from '../../../shared/components/alert';
import { Button } from '../../../shared/components/button';
import { FilePickerButton } from '../../../shared/components/file-picker-button';
import { MentionTextarea } from '../../../shared/components/mention-textarea';
import { useI18n } from '../../../shared/hooks/useI18n';
import { toMentionMarkup } from '../../../shared/mappers/content.mapper';
import type { ChannelVM } from '../../../shared/types/channel.types';
import type { MentionRefVM } from '../../../shared/types/content.types';
import type { MentionCandidateVM } from '../channel.types';
import { usePendingUploads } from '../hooks/usePendingUploads';
import { PendingUploads } from './pending-uploads';

export function Composer({
  channel,
  candidates,
  onSend,
}: {
  channel: ChannelVM;
  candidates: MentionCandidateVM[];
  onSend(input: { body: string; attachmentIds: string[] }): Promise<void>;
}) {
  const { t, errorMessage } = useI18n();
  const [body, setBody] = useState('');
  const [picked, setPicked] = useState<MentionRefVM[]>([]);
  const [sending, setSending] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const uploads = usePendingUploads();

  useEffect(() => {
    input.current?.focus();
  }, []);

  const canSend = !sending && !uploads.busy && (body.trim() !== '' || uploads.readyIds.length > 0);

  const send = async () => {
    if (!canSend) return;
    setSending(true);
    setError(null);
    try {
      await onSend({ body: toMentionMarkup(body.trim(), picked), attachmentIds: uploads.readyIds });
      setBody('');
      setPicked([]);
      uploads.clear();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSending(false);
      input.current?.focus();
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void send();
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) uploads.add(files);
  };

  return (
    <div
      className={clsx(
        'border-t border-line bg-surface px-4 py-3 sm:px-6',
        dragging && 'outline-2 -outline-offset-4 outline-accent outline-dashed',
      )}
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes('Files')) return;
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false);
      }}
      onDrop={onDrop}
    >
      {error && (
        <div className="mb-2">
          <Alert tone="error">{error}</Alert>
        </div>
      )}
      <PendingUploads uploads={uploads.uploads} onRemove={uploads.remove} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
        className="flex items-end gap-2"
      >
        <FilePickerButton label={t('files.attach')} onFiles={uploads.add} disabled={sending} />
        <label htmlFor="composer" className="sr-only">
          {t('channel.composer', { name: channel.name })}
        </label>
        <MentionTextarea
          id="composer"
          ref={input}
          value={body}
          onValueChange={setBody}
          candidates={candidates}
          picked={picked}
          onPickedChange={setPicked}
          onKeyDown={onKeyDown}
          onPaste={(e) => {
            const files = Array.from(e.clipboardData.files);
            if (files.length === 0) return;
            e.preventDefault();
            uploads.add(files);
          }}
          rows={1}
          maxLength={4000}
          placeholder={t('channel.composer', { name: channel.name })}
          aria-describedby="composer-hint"
          className="field-sizing-content block max-h-48 min-h-10 w-full resize-none rounded-[var(--radius-control)] border border-line bg-surface px-3 py-2 text-[0.9375rem] placeholder:text-muted/70 focus-visible:border-accent"
        />
        <Button type="submit" busy={sending} disabled={!canSend} className="h-10">
          <SendHorizontal aria-hidden className="size-4" />
          <span className="sr-only sm:not-sr-only">{t('channel.send')}</span>
        </Button>
      </form>
      <p id="composer-hint" className="mt-1 hidden text-xs text-muted sm:block">
        {t('channel.composerHint')} · {t('mention.hint')}
      </p>
    </div>
  );
}
