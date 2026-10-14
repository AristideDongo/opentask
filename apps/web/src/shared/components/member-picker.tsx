import { useId } from 'react';
import type { MemberVM } from '../types/workspace.types';
import { Avatar } from './avatar';

export function MemberPicker({
  label,
  members,
  value,
  onChange,
}: {
  label: string;
  members: MemberVM[];
  value: string[];
  onChange(ids: string[]): void;
}) {
  const id = useId();
  if (members.length === 0) return null;
  return (
    <fieldset className="space-y-1.5">
      <legend className="mb-1.5 text-sm font-semibold">{label}</legend>
      <div className="max-h-48 space-y-0.5 overflow-y-auto rounded-[var(--radius-control)] border border-line p-1">
        {members.map((m) => {
          const checked = value.includes(m.id);
          return (
            <label
              key={m.id}
              htmlFor={`${id}-${m.id}`}
              className="flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-control)] px-2 py-1.5 hover:bg-sunken"
            >
              <input
                id={`${id}-${m.id}`}
                type="checkbox"
                checked={checked}
                onChange={() =>
                  onChange(checked ? value.filter((v) => v !== m.id) : [...value, m.id])
                }
                className="size-4 accent-[var(--accent)]"
              />
              <Avatar initials={m.initials} size="sm" />
              <span className="min-w-0 truncate text-sm">{m.name}</span>
              <span className="ml-auto truncate text-xs text-muted">{m.email}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
