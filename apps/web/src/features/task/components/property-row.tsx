import type { ReactNode } from 'react';

export function PropertyRow({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: ReactNode;
}) {
  return (
    <>
      <dt>
        <label htmlFor={id} className="text-muted">
          {label}
        </label>
      </dt>
      <dd>{children}</dd>
    </>
  );
}
