import { z } from 'zod';
import { IdSchema, IsoDateTimeSchema } from '../common/primitives';
import { AssignableRoleSchema, WorkspaceRoleSchema } from '../workspaces/roles';

export const MemberSchema = z.object({
  userId: IdSchema,
  name: z.string(),
  email: z.string(),
  image: z.string().nullable(),
  role: WorkspaceRoleSchema,
  joinedAt: IsoDateTimeSchema,
});
export type Member = z.infer<typeof MemberSchema>;

export const MemberListSchema = z.object({ items: z.array(MemberSchema) });
export type MemberList = z.infer<typeof MemberListSchema>;

export const ChangeMemberRoleInputSchema = z.object({ role: AssignableRoleSchema });
export type ChangeMemberRoleInput = z.infer<typeof ChangeMemberRoleInputSchema>;
