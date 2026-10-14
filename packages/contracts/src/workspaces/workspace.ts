import { z } from 'zod';
import { IdSchema, IsoDateTimeSchema } from '../common/primitives';
import { WorkspaceRoleSchema } from './roles';

export const WorkspaceNameSchema = z
  .string()
  .trim()
  .min(1, { error: 'Nom requis.' })
  .max(80, { error: '80 caractères maximum.' });

export const WorkspaceSchema = z.object({
  id: IdSchema,
  name: z.string(),
  myRole: WorkspaceRoleSchema,
  memberCount: z.number().int(),
  createdAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema,
});
export type Workspace = z.infer<typeof WorkspaceSchema>;

export const WorkspaceListSchema = z.object({ items: z.array(WorkspaceSchema) });
export type WorkspaceList = z.infer<typeof WorkspaceListSchema>;

export const CreateWorkspaceInputSchema = z.object({ name: WorkspaceNameSchema });
export type CreateWorkspaceInput = z.infer<typeof CreateWorkspaceInputSchema>;

export const UpdateWorkspaceInputSchema = z.object({ name: WorkspaceNameSchema });
export type UpdateWorkspaceInput = z.infer<typeof UpdateWorkspaceInputSchema>;

export const DeleteWorkspaceInputSchema = z.object({ confirmName: z.string() });
export type DeleteWorkspaceInput = z.infer<typeof DeleteWorkspaceInputSchema>;

export const TransferOwnershipInputSchema = z.object({ userId: IdSchema });
export type TransferOwnershipInput = z.infer<typeof TransferOwnershipInputSchema>;
