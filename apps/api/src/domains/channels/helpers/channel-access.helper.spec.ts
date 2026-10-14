import { describe, expect, it } from 'vitest';
import {
  assertCanDeleteMessage,
  assertCanEditMessage,
  assertCanManageChannel,
  canAccessChannel,
  channelAudience,
} from './channel-access.helper';

const now = new Date();

describe('canaux', () => {
  it('canal public : membres non invités ; canal privé : membres explicites uniquement', () => {
    expect(canAccessChannel('member', { isPrivate: false, isChannelMember: false })).toBe(true);
    expect(canAccessChannel('guest', { isPrivate: false, isChannelMember: false })).toBe(false);
    expect(canAccessChannel('guest', { isPrivate: false, isChannelMember: true })).toBe(true);
    expect(canAccessChannel('owner', { isPrivate: true, isChannelMember: false })).toBe(false);
  });

  it('gestion : créateur ou administrateur ayant accès', () => {
    const channel = { createdById: 'a', isPrivate: false, isChannelMember: false };
    expect(() => assertCanManageChannel({ userId: 'a', role: 'member' }, channel)).not.toThrow();
    expect(() => assertCanManageChannel({ userId: 'b', role: 'member' }, channel)).toThrow();
    expect(() => assertCanManageChannel({ userId: 'b', role: 'admin' }, channel)).not.toThrow();
    expect(() =>
      assertCanManageChannel({ userId: 'b', role: 'owner' }, { ...channel, isPrivate: true }),
    ).toThrow();
  });

  it('messages : édition par l’auteur, suppression par l’auteur ou un administrateur', () => {
    const msg = { authorId: 'a', deletedAt: null };
    expect(() => assertCanEditMessage('a', msg)).not.toThrow();
    expect(() => assertCanEditMessage('b', msg)).toThrow();
    expect(() => assertCanDeleteMessage({ userId: 'b', role: 'admin' }, msg)).not.toThrow();
    expect(() => assertCanDeleteMessage({ userId: 'b', role: 'member' }, msg)).toThrow();
    expect(() => assertCanEditMessage('a', { ...msg, deletedAt: now })).toThrow();
  });

  it('audience des événements', () => {
    expect(channelAudience(true, ['a'])).toEqual({ userIds: ['a'] });
    expect(channelAudience(false, ['a'])).toEqual({ minRole: 'member', userIds: ['a'] });
  });
});
