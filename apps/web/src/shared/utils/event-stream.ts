import {
  REALTIME_EVENT_TYPES,
  type RealtimeEvent,
  RealtimeEventSchema,
} from '@opentask/contracts/realtime/event';

export interface EventStreamHandlers {
  onReady(): void;
  onEvent(event: RealtimeEvent): void;
  onError(closed: boolean): void;
}

export function openWorkspaceEvents(
  workspaceId: string,
  handlers: EventStreamHandlers,
): () => void {
  const source = new EventSource(`/api/v1/workspaces/${workspaceId}/events`);
  source.addEventListener('ready', () => handlers.onReady());
  const handle = (raw: MessageEvent<string>) => {
    const parsed = RealtimeEventSchema.safeParse(JSON.parse(raw.data));
    if (parsed.success) handlers.onEvent(parsed.data);
  };
  for (const type of REALTIME_EVENT_TYPES) source.addEventListener(type, handle);
  source.onerror = () => handlers.onError(source.readyState === EventSource.CLOSED);
  return () => source.close();
}
