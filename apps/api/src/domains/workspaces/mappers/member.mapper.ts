import { type Member, MemberSchema } from '@opentask/contracts/members/member';
import type { WorkspaceRole } from '@opentask/contracts/workspaces/roles';

interface MemberRow {
  role: WorkspaceRole;
  createdAt: Date;
  user: { id: string; name: string; email: string; image: string | null };
}

export const toMemberDto = (row: MemberRow): Member =>
  MemberSchema.parse({
    userId: row.user.id,
    name: row.user.name,
    email: row.user.email,
    image: row.user.image,
    role: row.role,
    joinedAt: row.createdAt.toISOString(),
  });
