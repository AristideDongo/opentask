import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { clsx } from 'clsx';
import { ChevronsUpDown, Plus } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useI18n } from '../../../shared/hooks/useI18n';
import type { WorkspaceVM } from '../../../shared/types/workspace.types';

const itemClass =
  'flex cursor-pointer items-center gap-2 rounded-[var(--radius-control)] px-2.5 py-2 text-sm outline-none data-[highlighted]:bg-sunken';

export function WorkspaceSwitcher({
  current,
  workspaces,
}: {
  current?: WorkspaceVM;
  workspaces: WorkspaceVM[];
}) {
  const { t } = useI18n();
  const navigate = useNavigate();
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="flex w-full items-center gap-2.5 rounded-[var(--radius-control)] border border-line px-3 py-2 text-left hover:bg-sunken">
        <span
          aria-hidden
          className="flex size-7 shrink-0 items-center justify-center rounded-[5px] bg-ink text-xs font-bold text-bg"
        >
          {(current?.name ?? '?').slice(0, 1).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1 truncate font-semibold">
          {current?.name ?? t('nav.workspaces')}
        </span>
        <ChevronsUpDown aria-hidden className="size-4 text-muted" />
        <span className="sr-only">{t('nav.switchWorkspace')}</span>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          className="z-50 min-w-[var(--radix-dropdown-menu-trigger-width)] rounded-[var(--radius-panel)] border border-line bg-surface p-1 shadow-lg"
        >
          <DropdownMenu.Label className="px-2.5 py-1.5 text-xs font-semibold text-muted">
            {t('nav.workspaces')}
          </DropdownMenu.Label>
          {workspaces.map((w) => (
            <DropdownMenu.Item
              key={w.id}
              onSelect={() => navigate(`/w/${w.id}`)}
              className={clsx(
                itemClass,
                'justify-between gap-3',
                w.id === current?.id && 'font-semibold',
              )}
            >
              <span className="truncate">{w.name}</span>
              <span className="text-xs text-muted">{t(`role.${w.role}`)}</span>
            </DropdownMenu.Item>
          ))}
          <DropdownMenu.Separator className="my-1 h-px bg-line" />
          <DropdownMenu.Item onSelect={() => navigate('/onboarding')} className={itemClass}>
            <Plus aria-hidden className="size-4" />
            {t('nav.newWorkspace')}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
