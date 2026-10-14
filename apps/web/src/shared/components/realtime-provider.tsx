import type { RealtimeEvent } from '@opentask/contracts/realtime/event';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRevalidator } from 'react-router';
import { type Realtime, RealtimeContext, type RealtimeListener } from '../hooks/useRealtime';
import type { ChannelVM } from '../types/channel.types';
import { openWorkspaceEvents } from '../utils/event-stream';

const REVALIDATING = new Set<RealtimeEvent['type']>([
  'channel.changed',
  'channel.deleted',
  'task.changed',
  'task.deleted',
  'task.commented',
  'project.changed',
  'team.changed',
  'members.changed',
]);

export function RealtimeProvider({
  workspaceId,
  meId,
  channels,
  children,
}: {
  workspaceId: string | undefined;
  meId: string;
  channels: ChannelVM[] | undefined;
  children: ReactNode;
}) {
  const revalidator = useRevalidator();
  const listeners = useRef(new Set<RealtimeListener>());
  const reconnectListeners = useRef(new Set<() => void>());
  const activeChannel = useRef<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [delta, setDelta] = useState<Record<string, number>>({});
  const revalidateTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [baseChannels, setBaseChannels] = useState(channels);
  if (baseChannels !== channels) {
    setBaseChannels(channels);
    setDelta({});
  }

  const revalidateRef = useRef(revalidator.revalidate);
  useEffect(() => {
    revalidateRef.current = revalidator.revalidate;
  });
  const scheduleRevalidate = useCallback(() => {
    clearTimeout(revalidateTimer.current);
    revalidateTimer.current = setTimeout(() => void revalidateRef.current(), 250);
  }, []);

  useEffect(() => {
    if (!workspaceId) return;
    const close = openWorkspaceEvents(workspaceId, {
      onReady() {
        setConnected(true);
        scheduleRevalidate();
        for (const l of reconnectListeners.current) l();
      },
      onEvent(event) {
        if (event.type === 'message.created') {
          const { channelId, author } = event.message;
          if (channelId !== activeChannel.current && author?.id !== meId) {
            setDelta((d) => ({ ...d, [channelId]: (d[channelId] ?? 0) + 1 }));
          }
        }
        if (REVALIDATING.has(event.type)) scheduleRevalidate();
        for (const l of listeners.current) l(event);
      },
      onError(closed) {
        setConnected(false);
        if (closed) scheduleRevalidate();
      },
    });
    return () => {
      close();
      setConnected(false);
      clearTimeout(revalidateTimer.current);
    };
  }, [workspaceId, meId, scheduleRevalidate]);

  const value = useMemo<Realtime>(
    () => ({
      connected,
      subscribe(listener) {
        listeners.current.add(listener);
        return () => listeners.current.delete(listener);
      },
      onReconnect(listener) {
        reconnectListeners.current.add(listener);
        return () => reconnectListeners.current.delete(listener);
      },
      unread(channelId) {
        if (channelId === activeChannel.current) return 0;
        const base = baseChannels?.find((c) => c.id === channelId)?.unreadCount ?? 0;
        return base + (delta[channelId] ?? 0);
      },
      setActiveChannel(channelId) {
        activeChannel.current = channelId;
        if (channelId) setDelta((d) => (d[channelId] ? { ...d, [channelId]: 0 } : d));
      },
    }),
    [connected, baseChannels, delta],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}
