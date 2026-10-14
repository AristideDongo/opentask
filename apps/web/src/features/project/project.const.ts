import { TASK_SORTS } from '@opentask/contracts/tasks/task';

export const FILTER_KEYS = ['columnId', 'priority', 'assigneeId', 'labelId', 'q', 'sort'] as const;

export const LIST_ONLY_FILTERS: readonly string[] = ['columnId', 'sort'];

export const SORT_OPTIONS = TASK_SORTS;

export const BOARD_VIEW = 'board';
