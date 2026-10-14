import { z } from 'zod';
import { IdSchema, nonEmptyPatch } from '../common/primitives';
import { ShortNameSchema } from '../common/text';

export const LABEL_PALETTE = [
  '#c62828',
  '#ef6c00',
  '#f9a825',
  '#c0ca33',
  '#2e7d32',
  '#00796b',
  '#1565c0',
  '#3949ab',
  '#7b1fa2',
  '#d81b60',
  '#795548',
  '#546e7a',
] as const;

export const HEX_COLOR = /^#[0-9a-f]{6}$/;

export const LabelSchema = z.object({ id: IdSchema, name: z.string(), color: z.string() });
export type Label = z.infer<typeof LabelSchema>;

export const LabelListSchema = z.object({ items: z.array(LabelSchema) });
export type LabelList = z.infer<typeof LabelListSchema>;

export const LabelColorSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(HEX_COLOR, { error: 'Couleur invalide (format #rrggbb).' });

export const CreateLabelInputSchema = z.object({ name: ShortNameSchema, color: LabelColorSchema });
export type CreateLabelInput = z.infer<typeof CreateLabelInputSchema>;

export const UpdateLabelInputSchema = nonEmptyPatch({
  name: ShortNameSchema,
  color: LabelColorSchema,
});
export type UpdateLabelInput = z.infer<typeof UpdateLabelInputSchema>;
