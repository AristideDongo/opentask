import { describe, expect, it } from 'vitest';
import { toMemberVM, toWorkspaceVM } from './workspace.mapper';

const workspace = {
  id: 'w',
  name: 'W',
  memberCount: 2,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};
const member = (userId: string, role: 'owner' | 'admin' | 'member' | 'guest') => ({
  userId,
  name: `Nom ${userId}`,
  email: `${userId}@x.org`,
  image: null,
  role,
  joinedAt: '2026-01-01T00:00:00.000Z',
});

describe('mappers', () => {
  it('calcule les permissions du workspace selon le rôle', () => {
    const admin = toWorkspaceVM({ ...workspace, myRole: 'admin' });
    expect(admin.permissions).toMatchObject({
      canInvite: true,
      canDelete: false,
      grantableRoles: ['member', 'guest'],
    });
    expect(toWorkspaceVM({ ...workspace, myRole: 'guest' }).permissions.canWriteTasks).toBe(false);
  });

  it('calcule ce que l’acteur peut faire sur chaque membre', () => {
    const actor = { userId: 'a', role: 'admin' as const };
    expect(toMemberVM(member('m', 'member'), actor)).toMatchObject({
      canChangeRole: true,
      canRemove: true,
      roleOptions: ['member', 'guest'],
    });
    expect(toMemberVM(member('o', 'owner'), actor)).toMatchObject({
      canChangeRole: false,
      canRemove: false,
    });
    expect(toMemberVM(member('a', 'admin'), actor)).toMatchObject({ isMe: true, canRemove: false });
  });
});
