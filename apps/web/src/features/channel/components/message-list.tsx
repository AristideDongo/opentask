import { useI18n } from '../../../shared/hooks/useI18n';
import { useToast } from '../../../shared/hooks/useToast';
import type { ChannelMessageVM } from '../channel.types';
import { toMessageRows } from '../mappers/message.mapper';
import { deleteMessage, editMessage } from '../servers/channel.service';
import { MessageItem } from './message-item';

export function MessageList({
  workspaceId,
  channelId,
  messages,
}: {
  workspaceId: string;
  channelId: string;
  messages: ChannelMessageVM[];
}) {
  const { t, formatDate, errorMessage } = useI18n();
  const { notify } = useToast();

  const edit = async (messageId: string, body: string) => {
    try {
      await editMessage(workspaceId, channelId, messageId, body);
      return true;
    } catch (e) {
      notify(errorMessage(e));
      return false;
    }
  };
  const remove = async (messageId: string) => {
    if (!window.confirm(t('channel.deleteMessageConfirm'))) return;
    try {
      await deleteMessage(workspaceId, channelId, messageId);
    } catch (e) {
      notify(errorMessage(e));
    }
  };

  return (
    <ol className="space-y-0.5">
      {toMessageRows(messages).map(({ message, showDay, compact }) => (
        <li key={message.id}>
          {showDay && (
            <div className="my-4 flex items-center gap-3 text-xs font-semibold text-muted">
              <span className="h-px flex-1 bg-line" />
              {formatDate(message.createdAt, { weekday: 'long', day: 'numeric', month: 'long' })}
              <span className="h-px flex-1 bg-line" />
            </div>
          )}
          <MessageItem
            message={message}
            compact={compact}
            onEdit={(body) => edit(message.id, body)}
            onDelete={() => void remove(message.id)}
          />
        </li>
      ))}
    </ol>
  );
}
