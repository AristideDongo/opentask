import type { TaskStatus } from '@opentask/contracts/tasks/status';
import type { Locale } from '@opentask/contracts/me/profile';

export const MAX_COLUMNS_PER_PROJECT = 20;
export const MAX_LABELS_PER_PROJECT = 50;

export const DEFAULT_COLUMNS: Record<Locale, { name: string; category: TaskStatus }[]> = {
  fr: [
    { name: 'À faire', category: 'todo' },
    { name: 'En cours', category: 'in_progress' },
    { name: 'En revue', category: 'in_review' },
    { name: 'Terminé', category: 'done' },
  ],
  en: [
    { name: 'To do', category: 'todo' },
    { name: 'In progress', category: 'in_progress' },
    { name: 'In review', category: 'in_review' },
    { name: 'Done', category: 'done' },
  ],
};

export const CATEGORY_NAMES: Record<TaskStatus, string> = {
  todo: 'À faire',
  in_progress: 'En cours',
  in_review: 'En revue',
  done: 'Terminé',
};
