import { useLocation } from 'react-router';
import { useI18n } from '../../../shared/hooks/useI18n';
import { useRealtimeEvent } from '../../../shared/hooks/useRealtime';
import { useToast } from '../../../shared/hooks/useToast';
import { toMentionNotice } from '../mappers/mention-notice.mapper';

export function MentionNotifier({ workspaceId }: { workspaceId: string }) {
  const { t } = useI18n();
  const { notify } = useToast();
  const { pathname } = useLocation();

  useRealtimeEvent((event) => {
    if (event.type !== 'mention.created') return;
    const notice = toMentionNotice(event, workspaceId, pathname);
    if (notice) notify(t(notice.key, notice.params), { to: notice.to, label: t('mention.open') });
  });

  return null;
}
