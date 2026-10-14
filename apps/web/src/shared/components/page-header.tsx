import type { ReactNode } from 'react';

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="mb-8 space-y-2">
      <h1 className="text-[1.75rem] leading-tight font-bold tracking-[-0.01em]">{title}</h1>
      {children && <div className="max-w-[65ch] text-muted">{children}</div>}
    </header>
  );
}
