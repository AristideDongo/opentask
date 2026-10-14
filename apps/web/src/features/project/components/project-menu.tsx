import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '../../../shared/hooks/useI18n';
import type { ProjectVM } from '../../../shared/types/project.types';
import { EditProjectDialog } from './edit-project-dialog';
import { MenuItem } from './menu-item';

export function ProjectMenu({ project }: { project: ProjectVM }) {
  const { t } = useI18n();
  const [editing, setEditing] = useState(false);
  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className="rounded-[var(--radius-control)] border border-line p-2 text-muted hover:bg-sunken hover:text-ink">
          <MoreHorizontal aria-hidden className="size-5" />
          <span className="sr-only">{t('project.actions')}</span>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            className="z-50 min-w-48 rounded-[var(--radius-panel)] border border-line bg-surface p-1 shadow-lg"
          >
            <MenuItem onSelect={() => setEditing(true)}>{t('project.edit')}</MenuItem>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <EditProjectDialog project={project} open={editing} onOpenChange={setEditing} />
    </>
  );
}
