import { useEffect, useRef } from 'react';
import { READ_DELAY_MS } from '../channel.const';
import { markChannelRead } from '../servers/channel.service';

export function useMarkRead(workspaceId: string, channelId: string) {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(
      () => void markChannelRead(workspaceId, channelId).catch(() => undefined),
      READ_DELAY_MS,
    );
  };
}
