import { useLoaderData } from 'react-router';
import { Button } from '../../shared/components/button';
import { useI18n } from '../../shared/hooks/useI18n';
import { useWorkspaceData } from '../../shared/hooks/useWorkspaceData';
import { ChannelHeader } from './components/channel-header';
import { Composer } from './components/composer';
import { MessageList } from './components/message-list';
import { useChannelMessages } from './hooks/useChannelMessages';
import { toChannelMessageVM } from './mappers/message.mapper';
import { toMentionCandidates } from './mappers/mention-candidates.mapper';
import { channelLoader, channelShouldRevalidate } from './servers/channel.loader';
import { sendMessage } from './servers/channel.service';

export const handle = { fullWidth: true };
export const clientLoader = channelLoader;
export const shouldRevalidate = channelShouldRevalidate;

export default function ChannelPage() {
  const { channel, page, members, viewer } = useLoaderData<typeof channelLoader>();
  const { workspace, members: workspaceMembers } = useWorkspaceData();
  const { t } = useI18n();
  const candidates = toMentionCandidates(channel, members, workspaceMembers, viewer.meId);
  const { messages, hasOlder, loadingOlder, loadOlder, append, scroller } = useChannelMessages(
    workspace.id,
    channel.id,
    page,
    viewer,
  );

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col lg:h-full">
      <ChannelHeader channel={channel} members={members} meId={viewer.meId} />
      <div
        ref={scroller}
        className="flex-1 overflow-y-auto px-4 py-4 sm:px-6"
        aria-live="polite"
        aria-relevant="additions"
      >
        {hasOlder && (
          <div className="mb-4 flex justify-center">
            <Button
              variant="secondary"
              size="sm"
              busy={loadingOlder}
              onClick={() => void loadOlder()}
            >
              {t('channel.loadOlder')}
            </Button>
          </div>
        )}
        {messages.length === 0 ? (
          <p className="py-16 text-center text-muted">{t('channel.empty')}</p>
        ) : (
          <MessageList
            workspaceId={workspace.id}
            channelId={channel.id}
            messages={messages}
            candidates={candidates}
          />
        )}
      </div>
      <Composer
        key={channel.id}
        channel={channel}
        candidates={candidates}
        onSend={async (input) =>
          append(toChannelMessageVM(await sendMessage(workspace.id, channel.id, input), viewer))
        }
      />
    </div>
  );
}
