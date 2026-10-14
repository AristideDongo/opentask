import type { TaskStatus } from '@opentask/contracts/tasks/status';
import { clsx } from 'clsx';
import { Circle, CircleCheck, CircleDashed, CircleDot } from 'lucide-react';

const ICONS = {
  todo: Circle,
  in_progress: CircleDashed,
  in_review: CircleDot,
  done: CircleCheck,
} as const;
const COLORS = {
  todo: 'text-muted',
  in_progress: 'text-[#b7791f] dark:text-[#f0c36d]',
  in_review: 'text-[#2563a8] dark:text-[#8db8ec]',
  done: 'text-accent',
} as const;

export function TaskStatusIcon({
  status,
  className = 'size-4',
}: {
  status: TaskStatus;
  className?: string;
}) {
  const Icon = ICONS[status];
  return <Icon aria-hidden className={clsx(className, COLORS[status])} />;
}
