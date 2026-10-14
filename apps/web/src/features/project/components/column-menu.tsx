import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { TASK_STATUSES, type TaskStatus } from '@opentask/contracts/tasks/status';
import { MoreHorizontal } from 'lucide-react';
import { TaskStatusIcon } from '../../../shared/components/task-status-icon';
import { useI18n } from '../../../shared/hooks/useI18n';
import type { ColumnVM } from '../../../shared/types/project.types';
import { MenuItem } from './menu-item';

export function ColumnMenu({
  column,
  canMoveLeft,
  canMoveRight,
  onRename,
  onCategoryChange,
  onMoveLeft,
  onMoveRight,
  onDelete,
}: {
  column: ColumnVM;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onRename(): void;
  onCategoryChange(category: TaskStatus): void;
  onMoveLeft(): void;
  onMoveRight(): void;
  onDelete(): void;
}) {
  const { t } = useI18n();
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="rounded-[var(--radius-control)] p-1 text-muted hover:bg-surface hover:text-ink">
        <MoreHorizontal aria-hidden className="size-4" />
        <span className="sr-only">{t('column.menu', { name: column.name })}</span>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="z-50 min-w-56 rounded-[var(--radius-panel)] border border-line bg-surface p-1 shadow-lg"
        >
          <MenuItem onSelect={onRename}>{t('column.rename')}</MenuItem>
          <DropdownMenu.Separator className="my-1 h-px bg-line" />
          <DropdownMenu.Label className="px-2.5 pt-1 text-xs font-semibold text-muted">
            {t('column.type')}
          </DropdownMenu.Label>
          <DropdownMenu.RadioGroup
            value={column.category}
            onValueChange={(value) => onCategoryChange(value as TaskStatus)}
          >
            {TASK_STATUSES.map((s) => (
              <DropdownMenu.RadioItem
                key={s}
                value={s}
                className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-control)] px-2.5 py-1.5 text-sm outline-none data-[highlighted]:bg-sunken data-[state=checked]:font-semibold"
              >
                <TaskStatusIcon status={s} />
                {t(`status.${s}`)}
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
          <DropdownMenu.Separator className="my-1 h-px bg-line" />
          {canMoveLeft && <MenuItem onSelect={onMoveLeft}>{t('column.moveLeft')}</MenuItem>}
          {canMoveRight && <MenuItem onSelect={onMoveRight}>{t('column.moveRight')}</MenuItem>}
          <MenuItem onSelect={onDelete} danger>
            {t('column.delete')}
          </MenuItem>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
