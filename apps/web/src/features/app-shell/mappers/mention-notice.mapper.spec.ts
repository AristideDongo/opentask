import { describe, expect, it } from 'vitest';
import { toMentionNotice } from './mention-notice.mapper';

const by = { id: 'u1', name: 'Alice' };

describe('toMentionNotice', () => {
  it('pointe vers le canal du message', () => {
    const event = {
      type: 'mention.created' as const,
      by,
      excerpt: 'salut',
      target: {
        kind: 'message' as const,
        channelId: 'c1',
        channelName: 'général',
        messageId: 'm1',
      },
    };
    expect(toMentionNotice(event, 'w1', '/w/w1')).toEqual({
      key: 'mention.inMessage',
      params: { name: 'Alice', channel: 'général' },
      to: '/w/w1/c/c1',
    });
    expect(toMentionNotice(event, 'w1', '/w/w1/c/c1')).toBeNull();
  });

  it('pointe vers la tâche commentée', () => {
    const event = {
      type: 'mention.created' as const,
      by,
      excerpt: 'relis',
      target: { kind: 'comment' as const, projectId: 'p1', taskId: 't1', taskTitle: 'Maquette' },
    };
    expect(toMentionNotice(event, 'w1', '/w/w1')?.to).toBe('/w/w1/p/p1/t/t1');
  });
});
