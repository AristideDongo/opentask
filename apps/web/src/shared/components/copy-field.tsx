import { Check, Copy } from 'lucide-react';
import { useId, useState } from 'react';
import { useI18n } from '../hooks/useI18n';
import { Button } from './button';
import { Input } from './form-controls';

export function CopyField({ value, label }: { value: string; label: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const id = useId();
  return (
    <div className="flex gap-2">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Input
        id={id}
        readOnly
        value={value}
        onFocus={(e) => e.currentTarget.select()}
        className="font-mono text-sm"
      />
      <Button
        variant="secondary"
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? (
          <Check aria-hidden className="size-4" />
        ) : (
          <Copy aria-hidden className="size-4" />
        )}
        <span aria-live="polite">{copied ? t('common.copied') : t('common.copy')}</span>
      </Button>
    </div>
  );
}
