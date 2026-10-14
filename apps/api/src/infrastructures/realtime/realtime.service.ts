import { Inject, Injectable, type MessageEvent } from '@nestjs/common';
import type { RealtimeEvent } from '@opentask/contracts/realtime/event';
import { type WorkspaceRole, isAtLeast } from '@opentask/contracts/workspaces/roles';
import { Observable, type Subscriber } from 'rxjs';
import { LOGGER, type Logger } from '../logger/logger.service';

const HEARTBEAT_MS = 25_000;

export interface Audience {
  minRole?: WorkspaceRole;
  userIds?: string[];
}

export const EVERYONE: Audience = { minRole: 'guest' };

export type ConnectionControl =
  | { type: 'membership.revoked'; userId: string }
  | { type: 'membership.role_changed'; userId: string; role: WorkspaceRole }
  | { type: 'workspace.deleted' };

interface Connection {
  userId: string;
  role: WorkspaceRole;
  subscriber: Subscriber<MessageEvent>;
}

@Injectable()
export class RealtimeService {
  private readonly connections = new Map<string, Set<Connection>>();

  constructor(@Inject(LOGGER) private readonly logger: Logger) {}

  connect(workspaceId: string, userId: string, role: WorkspaceRole): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      const connection: Connection = { userId, role, subscriber };
      const set = this.connections.get(workspaceId) ?? new Set();
      set.add(connection);
      this.connections.set(workspaceId, set);
      subscriber.next({ type: 'ready', data: {} });
      const heartbeat = setInterval(
        () => subscriber.next({ type: 'ping', data: {} }),
        HEARTBEAT_MS,
      );
      heartbeat.unref();
      return () => {
        clearInterval(heartbeat);
        set.delete(connection);
        if (set.size === 0) this.connections.delete(workspaceId);
      };
    });
  }

  publish(workspaceId: string, event: RealtimeEvent, audience: Audience): void {
    const set = this.connections.get(workspaceId);
    if (!set) return;
    const allowed = new Set(audience.userIds ?? []);
    for (const c of set) {
      const delivered =
        allowed.has(c.userId) ||
        (audience.minRole !== undefined && isAtLeast(c.role, audience.minRole));
      if (delivered) c.subscriber.next({ type: event.type, data: event });
    }
    this.logger.debug({ type: event.type, workspaceId }, 'Événement temps réel diffusé');
  }

  control(workspaceId: string, event: ConnectionControl): void {
    const set = this.connections.get(workspaceId);
    if (!set) return;
    for (const c of [...set]) {
      if (
        event.type === 'workspace.deleted' ||
        (event.type === 'membership.revoked' && c.userId === event.userId)
      ) {
        c.subscriber.complete();
      } else if (event.type === 'membership.role_changed' && c.userId === event.userId) {
        c.role = event.role;
      }
    }
  }

  connectionCount(workspaceId?: string): number {
    if (workspaceId) return this.connections.get(workspaceId)?.size ?? 0;
    let total = 0;
    for (const set of this.connections.values()) total += set.size;
    return total;
  }
}
