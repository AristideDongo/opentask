import { useSearchParams } from 'react-router';
import { isActiveFilter, isBoardView } from '../mappers/task-query.mapper';
import { BOARD_VIEW, FILTER_KEYS } from '../project.const';
import type { ProjectView } from '../project.types';

export function useProjectFilters() {
  const [params, setParams] = useSearchParams();
  const board = isBoardView(params);

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const reset = () =>
    setParams(board ? new URLSearchParams({ view: BOARD_VIEW }) : new URLSearchParams(), {
      replace: true,
    });

  return {
    board,
    get: (key: string) => params.get(key) ?? '',
    set,
    reset,
    setView: (view: ProjectView) => set('view', view === 'board' ? BOARD_VIEW : ''),
    hasActive: FILTER_KEYS.some((key) => params.get(key) && isActiveFilter(key, board)),
    grouped: (params.get('sort') ?? 'position') === 'position',
  };
}
