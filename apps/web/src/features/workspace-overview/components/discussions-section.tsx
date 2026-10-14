import { Hash, Lock } from 'lucide-react';
import { Link } from 'react-router';
import { Section } from '../../../shared/components/section';
import { useI18n } from '../../../shared/hooks/useI18n';
import { useRealtime } from '../../../shared/hooks/useRealtime';
import type { ChannelVM } from '../../../shared/types/channel.types';

export function DiscussionsSection({
  workspaceId,
  channels,
}: {
  workspaceId: string;
  channels: ChannelVM[];
}) {
  const { t } = useI18n();
  const { unread } = useRealtime();
  return (
    <Section title={t('home.channels')}>
      <ul className="space-y-1">
        {channels.map((c) => {
          const Icon = c.isPrivate ? Lock : Hash;
          const count = unread(c.id);
          return (
            <li key={c.id}>
              <Link
                to={`/w/${workspaceId}/c/${c.id}`}
                aria-label={t('home.openChat', { name: c.name })}
                className="flex items-center gap-2 rounded-[var(--radius-control)] px-2 py-1.5 hover:bg-sunken"
              >
                <Icon aria-hidden className="size-4 text-muted" />
                <span className={count ? 'font-semibold' : undefined}>{c.name}</span>
                {count > 0 && (
                  <span className="ml-auto rounded-full bg-accent px-1.5 text-xs font-bold text-accent-ink">
                    {count}
                    <span className="sr-only"> {t('nav.unread', { count })}</span>
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
