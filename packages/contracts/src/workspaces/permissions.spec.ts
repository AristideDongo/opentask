import { describe, expect, it } from 'vitest';
import {
  type WorkspaceAction,
  can,
  canGrantRole,
  decideMemberRemoval,
  decideOwnershipTransfer,
  decideRoleChange,
  decideTaskDeletion,
} from './permissions';
import { WORKSPACE_ROLES, type WorkspaceRole } from './roles';
import { WorkspaceNameSchema } from './workspace';

const owner = { userId: 'o', role: 'owner' as const };
const admin = { userId: 'a', role: 'admin' as const };
const admin2 = { userId: 'a2', role: 'admin' as const };
const member = { userId: 'm', role: 'member' as const };
const guest = { userId: 'g', role: 'guest' as const };

describe('matrice des permissions', () => {
  const matrix: Record<WorkspaceAction, WorkspaceRole[]> = {
    'workspace.read': ['owner', 'admin', 'member', 'guest'],
    'workspace.update': ['owner', 'admin'],
    'workspace.delete': ['owner'],
    'workspace.transferOwnership': ['owner'],
    'member.list': ['owner', 'admin', 'member', 'guest'],
    'member.invite': ['owner', 'admin'],
    'invitation.manage': ['owner', 'admin'],
    'audit.read': ['owner', 'admin'],
    'team.manage': ['owner', 'admin'],
    'project.create': ['owner', 'admin', 'member'],
    'project.update': ['owner', 'admin', 'member'],
    'project.delete': ['owner', 'admin'],
    'task.read': ['owner', 'admin', 'member', 'guest'],
    'task.write': ['owner', 'admin', 'member'],
    'task.comment': ['owner', 'admin', 'member', 'guest'],
    'channel.create': ['owner', 'admin', 'member'],
    'channel.readPublic': ['owner', 'admin', 'member'],
  };

  for (const [action, allowed] of Object.entries(matrix) as [WorkspaceAction, WorkspaceRole[]][]) {
    for (const role of WORKSPACE_ROLES) {
      it(`${role} ${allowed.includes(role) ? 'peut' : 'ne peut pas'} ${action}`, () => {
        expect(can(role, action)).toBe(allowed.includes(role));
      });
    }
  }

  it('seul le propriétaire peut accorder le rôle administrateur', () => {
    expect(canGrantRole('owner', 'admin')).toBe(true);
    expect(canGrantRole('admin', 'admin')).toBe(false);
    expect(canGrantRole('admin', 'member')).toBe(true);
    expect(canGrantRole('member', 'guest')).toBe(false);
  });
});

describe('décisions', () => {
  it('changement de rôle', () => {
    expect(decideRoleChange(owner, member, 'admin')).toEqual({ allowed: true });
    expect(decideRoleChange(admin, member, 'guest')).toEqual({ allowed: true });
    expect(decideRoleChange(admin, member, 'admin')).toMatchObject({ allowed: false });
    expect(decideRoleChange(admin, admin2, 'member')).toMatchObject({ allowed: false });
    expect(decideRoleChange(admin, owner, 'member')).toEqual({
      allowed: false,
      reason: 'owner_role_locked',
    });
    expect(decideRoleChange(member, guest, 'member')).toMatchObject({ allowed: false });
    expect(decideRoleChange(admin, admin, 'member')).toEqual({
      allowed: false,
      reason: 'own_role',
    });
  });

  it('retrait de membre', () => {
    expect(decideMemberRemoval(member, member)).toEqual({ allowed: true });
    expect(decideMemberRemoval(owner, owner)).toEqual({
      allowed: false,
      reason: 'owner_must_transfer',
    });
    expect(decideMemberRemoval(admin, guest)).toEqual({ allowed: true });
    expect(decideMemberRemoval(admin, admin2)).toMatchObject({ allowed: false });
    expect(decideMemberRemoval(member, guest)).toMatchObject({ allowed: false });
  });

  it('transfert de propriété', () => {
    expect(decideOwnershipTransfer(owner, admin)).toEqual({ allowed: true });
    expect(decideOwnershipTransfer(admin, member)).toMatchObject({ allowed: false });
    expect(decideOwnershipTransfer(owner, guest)).toEqual({
      allowed: false,
      reason: 'guest_cannot_own',
    });
  });

  it('suppression de tâche : auteur ou administrateur, jamais un invité', () => {
    expect(decideTaskDeletion(member, { createdById: 'm' })).toEqual({ allowed: true });
    expect(decideTaskDeletion({ userId: 'x', role: 'member' }, { createdById: 'm' })).toMatchObject(
      { allowed: false },
    );
    expect(decideTaskDeletion(admin, { createdById: 'm' })).toEqual({ allowed: true });
    expect(decideTaskDeletion(guest, { createdById: 'g' })).toMatchObject({ allowed: false });
  });
});

describe('workspace', () => {
  it('nettoie le nom', () => {
    expect(WorkspaceNameSchema.parse('  Équipe produit  ')).toBe('Équipe produit');
    expect(WorkspaceNameSchema.safeParse('   ').success).toBe(false);
  });
});
