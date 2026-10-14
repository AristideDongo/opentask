import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useRealtime, useRealtimeEvent } from '../../../shared/hooks/useRealtime';
import { NEAR_BOTTOM_PX } from '../channel.const';
import type { ChannelMessageVM, MessagePageVM, MessageViewer } from '../channel.types';
import { mergeMessages, toChannelMessageVM, toMessagePageVM } from '../mappers/message.mapper';
import { fetchMessages } from '../servers/channel.service';
import { useMarkRead } from './useMarkRead';

export function useChannelMessages(
  workspaceId: string,
  channelId: string,
  page: MessagePageVM,
  viewer: MessageViewer,
) {
  const realtime = useRealtime();
  const scheduleRead = useMarkRead(workspaceId, channelId);
  const [messages, setMessages] = useState(() => mergeMessages([], page.messages));
  const [cursor, setCursor] = useState(page.nextCursor);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [source, setSource] = useState(page);
  const scroller = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const restoreFrom = useRef<number | null>(null);

  if (source !== page) {
    setSource(page);
    setMessages((current) =>
      current[0]?.channelId === channelId
        ? mergeMessages(current, page.messages)
        : mergeMessages([], page.messages),
    );
    setCursor(page.nextCursor);
  }

  useEffect(() => {
    realtime.setActiveChannel(channelId);
    stickToBottom.current = true;
    scheduleRead();
    return () => realtime.setActiveChannel(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId]);

  useRealtimeEvent((event) => {
    if (!('message' in event) || event.message.channelId !== channelId) return;
    const el = scroller.current;
    stickToBottom.current =
      !el || el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
    setMessages((current) => mergeMessages(current, [toChannelMessageVM(event.message, viewer)]));
    if (event.type === 'message.created') scheduleRead();
  });

  useEffect(
    () =>
      realtime.onReconnect(() => {
        void fetchMessages(workspaceId, channelId).then((p) =>
          setMessages((current) => mergeMessages(current, toMessagePageVM(p, viewer).messages)),
        );
      }),
    [realtime, workspaceId, channelId, viewer],
  );

  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    if (restoreFrom.current !== null) {
      el.scrollTop = el.scrollHeight - restoreFrom.current;
      restoreFrom.current = null;
    } else if (stickToBottom.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const loadOlder = async () => {
    if (!cursor) return;
    setLoadingOlder(true);
    try {
      const older = toMessagePageVM(await fetchMessages(workspaceId, channelId, cursor), viewer);
      restoreFrom.current = scroller.current
        ? scroller.current.scrollHeight - scroller.current.scrollTop
        : null;
      stickToBottom.current = false;
      setMessages((current) => mergeMessages(current, older.messages));
      setCursor(older.nextCursor);
    } finally {
      setLoadingOlder(false);
    }
  };

  const append = (message: ChannelMessageVM) => {
    stickToBottom.current = true;
    setMessages((current) => mergeMessages(current, [message]));
  };

  return { messages, hasOlder: cursor !== null, loadingOlder, loadOlder, append, scroller };
}
