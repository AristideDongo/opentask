import { describe, expect, it } from 'vitest';
import type { MemberVM } from '../../../shared/types/workspace.types';
import { toMentionCandidates } from './mention-candidates.mapper';

const member = (id: string, role: MemberVM['role']) =>
  ({ id, name: id.toUpperCase(), initials: id, role }) as MemberVM;
const workspace = [
  member('me', 'owner'),
  member('bob', 'member'),
  member('gus', 'guest'),
  member('ann', 'admin'),
];

describe('toMentionCandidates', () => {
  it('propose les membres qui peuvent lire un canal public, sans moi', () => {
    expect(toMentionCandidates({ isPrivate: false }, [], workspace, 'me').map((c) => c.id)).toEqual(
      ['ann', 'bob'],
    );
  });

  it('ne propose dans un canal privé que ses membres', () => {
    const channelMembers = [{ id: 'gus', name: 'GUS', initials: 'G' }];
    expect(
      toMentionCandidates({ isPrivate: true }, channelMembers, workspace, 'me').map((c) => c.id),
    ).toEqual(['gus']);
  });
});
