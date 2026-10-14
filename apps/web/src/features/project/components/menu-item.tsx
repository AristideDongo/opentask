import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { clsx } from 'clsx';

export function MenuItem({
  children,
  onSelect,
  danger = false,
}: {
  children: string;
  onSelect(): void;
  danger?: boolean;
}) {
  return (
    <DropdownMenu.Item
      onSelect={onSelect}
      className={clsx(
        'cursor-pointer rounded-[var(--radius-control)] px-2.5 py-1.5 text-sm outline-none data-[highlighted]:bg-sunken',
        danger && 'text-danger',
      )}
    >
      {children}
    </DropdownMenu.Item>
  );
}
