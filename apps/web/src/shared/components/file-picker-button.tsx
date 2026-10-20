import { Paperclip } from 'lucide-react';
import { useRef } from 'react';

export function FilePickerButton({
  label,
  onFiles,
  disabled = false,
  accept,
  className = 'inline-flex h-10 items-center justify-center rounded-[var(--radius-control)] border border-line bg-surface px-3 text-muted hover:bg-sunken hover:text-ink disabled:opacity-50',
  showLabel = false,
}: {
  label: string;
  onFiles(files: File[]): void;
  disabled?: boolean;
  accept?: string;
  className?: string;
  showLabel?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={input}
        type="file"
        multiple
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = '';
          if (files.length) onFiles(files);
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => input.current?.click()}
        className={className}
      >
        <Paperclip aria-hidden className="size-4" />
        <span className={showLabel ? 'ml-1.5' : 'sr-only'}>{label}</span>
      </button>
    </>
  );
}
