import { clsx } from 'clsx';
import { type ComponentProps, type ReactNode, useId } from 'react';

const widthClass = (className?: string) =>
  /(^|\s)(sm:|md:|lg:)?w-/.test(className ?? '') ? undefined : 'w-full';

const controlClass =
  'block rounded-[var(--radius-control)] border border-line bg-surface px-3 text-ink placeholder:text-muted/70 ' +
  'aria-[invalid=true]:border-danger focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:border-accent';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input {...props} className={clsx(controlClass, widthClass(className), 'h-10', className)} />
  );
}

export function Select({ className, ...props }: ComponentProps<'select'>) {
  return (
    <select
      {...props}
      className={clsx(controlClass, widthClass(className), 'h-10 pr-8', className)}
    />
  );
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      {...props}
      className={clsx(controlClass, 'w-full py-2 text-[0.9375rem] disabled:bg-sunken', className)}
    />
  );
}

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: (props: {
    id: string;
    'aria-invalid'?: boolean;
    'aria-describedby'?: string;
  }) => ReactNode;
}) {
  const id = useId();
  const describedBy =
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
      </label>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
