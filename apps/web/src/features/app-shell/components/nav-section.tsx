import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';

export function NavSection({
  title,
  action,
  status,
  children,
}: {
  title: string;
  action?: ReactNode;
  status?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-1 flex h-7 items-center gap-2 pr-1 pl-2.5">
        <h2 className="text-sm font-semibold text-muted">{title}</h2>
        {status}
        <span className="ml-auto">{action}</span>
      </div>
      <ul className="space-y-0.5">{children}</ul>
    </section>
  );
}

export function AddButton({ label, ...props }: { label: string }) {
  return (
    <button
      type="button"
      {...props}
      className="flex size-7 items-center justify-center rounded-[var(--radius-control)] text-muted hover:bg-sunken hover:text-ink"
    >
      <Plus aria-hidden className="size-4" />
      <span className="sr-only">{label}</span>
    </button>
  );
}
