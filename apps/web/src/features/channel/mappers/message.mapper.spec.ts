import type { Message } from '@opentask/contracts/channels/message';
import { describe, expect, it } from 'vitest';
import type { ChannelMessageVM } from '../channel.types';
import { mergeMessages, toChannelMessageVM, toMessageRows } from './message.mapper';

const message = (id: string, createdAt: string, authorId = 'u1'): ChannelMessageVM => ({
  id,
  channelId: 'c1',
  author: { id: authorId, name: authorId, initials: 'U' },
  body: id,
  isDeleted: false,
  isEdited: false,
  isMine: false,
  canEdit: false,
  canDelete: false,
  createdAt,
});

describe('toChannelMessageVM', () => {
  const raw: Message = {
    id: 'm1',
    channelId: 'c1',
    author: { id: 'u1', name: 'Alice' },
    body: 'Bonjour',
    createdAt: '2026-01-01T10:00:00.000Z',
    editedAt: null,
    deletedAt: null,
  } as Message;

  it('lets the author edit and delete', () => {
    expect(toChannelMessageVM(raw, { meId: 'u1', canModerate: false })).toMatchObject({
      canEdit: true,
      canDelete: true,
    });
  });

  it('lets moderators delete only', () => {
    expect(toChannelMessageVM(raw, { meId: 'u2', canModerate: true })).toMatchObject({
      canEdit: false,
      canDelete: true,
    });
  });

  it('forbids everything on deleted messages', () => {
    const deleted = { ...raw, deletedAt: '2026-01-01T11:00:00.000Z' };
    expect(toChannelMessageVM(deleted, { meId: 'u1', canModerate: true })).toMatchObject({
      canEdit: false,
      canDelete: false,
    });
  });
});

describe('mergeMessages', () => {
  it('deduplicates by id and sorts chronologically', () => {
    const merged = mergeMessages(
      [message('b', '2026-01-01T10:01:00Z')],
      [message('a', '2026-01-01T10:00:00Z'), message('b', '2026-01-01T10:01:00Z')],
    );
    expect(merged.map((m) => m.id)).toEqual(['a', 'b']);
  });
});

describe('toMessageRows', () => {
  it('groups consecutive messages of the same author', () => {
    const rows = toMessageRows([
      message('a', '2026-01-01T10:00:00Z'),
      message('b', '2026-01-01T10:02:00Z'),
      message('c', '2026-01-01T10:30:00Z'),
      message('d', '2026-01-01T10:31:00Z', 'u2'),
      message('e', '2026-01-02T10:00:00Z', 'u2'),
    ]);
    expect(rows.map((r) => [r.showDay, r.compact])).toEqual([
      [true, false],
      [false, true],
      [false, false],
      [false, false],
      [true, false],
    ]);
  });
});
