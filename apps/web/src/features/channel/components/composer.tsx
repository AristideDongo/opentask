import { SendHorizontal } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Alert } from '../../../shared/components/alert';
import { Button } from '../../../shared/components/button';
import { useI18n } from '../../../shared/hooks/useI18n';
import type { ChannelVM } from '../../../shared/types/channel.types';

export function Composer({
  channel,
  onSend,
}: {
  channel: ChannelVM;
  onSend(body: string): Promise<void>;
}) {
  const { t, errorMessage } = useI18n();
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    input.current?.focus();
  }, []);

  const send = async () => {
    const text = body.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);
    try {
      await onSend(text);
      setBody('');
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

  return (
    <div className="border-t border-line bg-surface px-4 py-3 sm:px-6">
      {error && (
        <div className="mb-2">
          <Alert tone="error">{error}</Alert>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
        className="flex items-end gap-2"
      >
        <label htmlFor="composer" className="sr-only">
          {t('channel.composer', { name: channel.name })}
        </label>
        <textarea
          id="composer"
          ref={input}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          maxLength={4000}
          placeholder={t('channel.composer', { name: channel.name })}
          aria-describedby="composer-hint"
          className="field-sizing-content block max-h-48 min-h-10 flex-1 resize-none rounded-[var(--radius-control)] border border-line bg-surface px-3 py-2 text-[0.9375rem] placeholder:text-muted/70 focus-visible:border-accent"
        />
        <Button type="submit" busy={sending} disabled={!body.trim()} className="h-10">
          <SendHorizontal aria-hidden className="size-4" />
          <span className="sr-only sm:not-sr-only">{t('channel.send')}</span>
        </Button>
      </form>
      <p id="composer-hint" className="mt-1 hidden text-xs text-muted sm:block">
        {t('channel.composerHint')}
      </p>
    </div>
  );
}
