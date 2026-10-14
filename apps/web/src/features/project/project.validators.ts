import { DescriptionSchema, EntityNameSchema } from '@opentask/contracts/common/text';
import type { UpdateProjectInput } from '@opentask/contracts/projects/project';
import { z } from 'zod';

export const EditProjectFormSchema = z.object({
  name: EntityNameSchema,
  description: DescriptionSchema,
  teamId: z.string(),
});

export type EditProjectFormValues = z.input<typeof EditProjectFormSchema>;

export type EditProjectFormData = z.output<typeof EditProjectFormSchema>;

export const toUpdateProjectInput = (values: EditProjectFormData): UpdateProjectInput => ({
  ...values,
  teamId: values.teamId || null,
});
