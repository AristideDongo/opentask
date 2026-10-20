import { describe, expect, it } from 'vitest';
import { canSeeChannel, mentionExcerpt, newlyMentioned } from './mention.helper';

describe('mentions', () => {
  it('remplace les jetons par les noms dans l’extrait', () => {
    expect(mentionExcerpt('Merci <@u1> et <@u9> !', [{ id: 'u1', name: 'Alice' }])).toBe(
      'Merci @Alice et @quelqu’un !',
    );
    expect(mentionExcerpt('x'.repeat(200), [])).toHaveLength(141);
  });

  it('ne notifie ni l’auteur ni les personnes déjà mentionnées', () => {
    const after = [
      { id: 'author', name: 'Moi' },
      { id: 'u1', name: 'Alice' },
      { id: 'u2', name: 'Bob' },
    ];
    expect(newlyMentioned(['u1'], after, 'author')).toEqual([{ id: 'u2', name: 'Bob' }]);
  });

  it('ne mentionne dans un canal que les personnes qui peuvent le lire', () => {
    const member = { id: 'u', name: 'U', role: 'member' as const, isChannelMember: false };
    const guest = { ...member, role: 'guest' as const };
    expect(canSeeChannel(member, false)).toBe(true);
    expect(canSeeChannel(member, true)).toBe(false);
    expect(canSeeChannel(guest, false)).toBe(false);
    expect(canSeeChannel({ ...guest, isChannelMember: true }, true)).toBe(true);
  });
});
