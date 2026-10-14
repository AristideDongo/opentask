import { z } from 'zod';

export const EntityNameSchema = z
  .string()
  .trim()
  .min(1, { error: 'Nom requis.' })
  .max(80, { error: '80 caractères maximum.' });

export const ShortNameSchema = z
  .string()
  .trim()
  .min(1, { error: 'Nom requis.' })
  .max(40, { error: '40 caractères maximum.' });

export const DescriptionSchema = z.string().trim().max(2000, { error: '2000 caractères maximum.' });
