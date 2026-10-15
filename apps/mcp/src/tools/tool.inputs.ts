import { z } from 'zod';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../helpers/limits.const';

export const idInput = (description: string) => z.string().min(1).max(64).describe(description);

export const workspaceIdInput = idInput(
  'Identifiant du workspace (voir opentask_list_workspaces).',
);

export const projectIdInput = idInput('Identifiant du projet (voir opentask_list_projects).');

export const taskIdInput = idInput('Identifiant de la tâche.');

export const offsetInput = z
  .number()
  .int()
  .min(0)
  .default(0)
  .describe('Position de départ (pagination).');

export const limitInput = z
  .number()
  .int()
  .min(1)
  .max(MAX_PAGE_SIZE)
  .default(DEFAULT_PAGE_SIZE)
  .describe(`Nombre d’éléments (1 à ${MAX_PAGE_SIZE}).`);
