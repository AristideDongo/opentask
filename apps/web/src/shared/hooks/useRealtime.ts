import type { RealtimeEvent } from '@opentask/contracts/realtime/event';
import { createContext, useContext, useEffect, useRef } from 'react';

export type RealtimeListener = (event: RealtimeEvent) => void;

export interface Realtime {
  connected: boolean;
  subscribe(listener: RealtimeListener): () => void;
  onReconnect(listener: () => void): () => void;
  unread(channelId: string): number;
  setActiveChannel(channelId: string | null): void;
}

export const RealtimeContext = createContext<Realtime | null>(null);

export function useRealtime(): Realtime {
  const ctx = useContext(RealtimeContext);
  if (!ctx) throw new Error('useRealtime doit être utilisé dans <RealtimeProvider>');
  return ctx;
}

export function useRealtimeEvent(listener: RealtimeListener) {
  const { subscribe } = useRealtime();
  const ref = useRef(listener);
  useEffect(() => {
    ref.current = listener;
  });
  useEffect(() => subscribe((event) => ref.current(event)), [subscribe]);
}
