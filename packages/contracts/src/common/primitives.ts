import { z } from 'zod';

export const IdSchema = z.string().min(1).max(64);
export const IsoDateTimeSchema = z.iso.datetime();

export const EmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: 'Adresse e-mail invalide.' }).max(254));

export const RefSchema = z.object({ id: IdSchema, name: z.string() });
export type Ref = z.infer<typeof RefSchema>;

export const nonEmptyPatch = <T extends z.ZodRawShape>(shape: T) =>
  z
    .object(shape)
    .partial()
    .refine((v) => Object.keys(v).length > 0, { error: 'Aucune modification fournie.' });
