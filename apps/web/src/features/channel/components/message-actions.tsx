import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { useI18n } from '../../../shared/hooks/useI18n';
import type { ChannelMessageVM } from '../channel.types';

const itemClass =
  'cursor-pointer rounded-[var(--radius-control)] px-2.5 py-1.5 text-sm outline-none data-[highlighted]:bg-sunken';

export function MessageActions({
  message,
  onEdit,
  onDelete,
}: {
  message: ChannelMessageVM;
  onEdit(): void;
  onDelete(): void;
}) {
  const { t } = useI18n();
  return (
    <div className="absolute top-1 right-2 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className="rounded-[var(--radius-control)] border border-line bg-surface p-1 text-muted hover:text-ink focus-visible:opacity-100">
          <MoreHorizontal aria-hidden className="size-4" />
          <span className="sr-only">{t('channel.messageActions')}</span>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            className="z-50 min-w-36 rounded-[var(--radius-panel)] border border-line bg-surface p-1 shadow-lg"
          >
            {message.canEdit && (
              <DropdownMenu.Item onSelect={onEdit} className={itemClass}>
                {t('channel.edit')}
              </DropdownMenu.Item>
            )}
            {message.canDelete && (
              <DropdownMenu.Item onSelect={onDelete} className={`${itemClass} text-danger`}>
                {t('channel.deleteMessage')}
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
