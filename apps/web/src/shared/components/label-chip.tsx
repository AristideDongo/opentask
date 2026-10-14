import { clsx } from 'clsx';
import type { LabelVM } from '../types/project.types';

export function LabelChip({
  label,
  size = 'sm',
}: {
  label: Pick<LabelVM, 'name' | 'color' | 'textColor'>;
  size?: 'sm' | 'md';
}) {
  return (
    <span
      className={clsx(
        'inline-flex max-w-full items-center truncate rounded font-semibold',
        size === 'sm' ? 'h-5 px-1.5 text-xs' : 'h-6 px-2 text-sm',
      )}
      style={{ backgroundColor: label.color, color: label.textColor }}
    >
      {label.name}
    </span>
  );
}

export function LabelList({ labels }: { labels: LabelVM[] }) {
  if (labels.length === 0) return null;
  return (
    <span className="inline-flex flex-wrap gap-1">
      {labels.map((l) => (
        <LabelChip key={l.id} label={l} />
      ))}
    </span>
  );
}
