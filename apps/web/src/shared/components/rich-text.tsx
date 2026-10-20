import { clsx } from 'clsx';
import type { TextSegmentVM } from '../types/content.types';

export function RichText({
  segments,
  className,
}: {
  segments: TextSegmentVM[];
  className?: string;
}) {
  return (
    <p className={clsx('break-words whitespace-pre-wrap', className)}>
      {segments.map((segment, index) =>
        segment.type === 'text' ? (
          <span key={index}>{segment.text}</span>
        ) : (
          <span
            key={index}
            className={clsx(
              'rounded px-1 font-semibold',
              segment.isMe ? 'bg-accent text-accent-ink' : 'bg-accent-soft text-accent',
            )}
          >
            @{segment.name}
          </span>
        ),
      )}
    </p>
  );
}
