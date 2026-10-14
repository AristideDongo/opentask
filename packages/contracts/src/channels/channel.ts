import { z } from 'zod';
import { IdSchema, IsoDateTimeSchema, RefSchema, nonEmptyPatch } from '../common/primitives';
import { DescriptionSchema, EntityNameSchema } from '../common/text';

export const ChannelSchema = z.object({
  id: IdSchema,
  name: z.string(),
  description: z.string(),
  isPrivate: z.boolean(),
  isMember: z.boolean(),
  canManage: z.boolean(),
  unreadCount: z.number().int(),
  createdBy: RefSchema.nullable(),
  createdAt: IsoDateTimeSchema,
});
export type Channel = z.infer<typeof ChannelSchema>;

export const ChannelListSchema = z.object({ items: z.array(ChannelSchema) });
export type ChannelList = z.infer<typeof ChannelListSchema>;

export const CreateChannelInputSchema = z.object({
  name: EntityNameSchema,
  description: DescriptionSchema.default(''),
  isPrivate: z.boolean().default(false),
  memberIds: z.array(IdSchema).max(500).default([]),
});
export type CreateChannelInput = z.input<typeof CreateChannelInputSchema>;

export const UpdateChannelInputSchema = nonEmptyPatch({
  name: EntityNameSchema,
  description: DescriptionSchema,
});
export type UpdateChannelInput = z.infer<typeof UpdateChannelInputSchema>;

export const ChannelMemberListSchema = z.object({ items: z.array(RefSchema) });
export type ChannelMemberList = z.infer<typeof ChannelMemberListSchema>;
