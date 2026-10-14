import { BOARD_VIEW, FILTER_KEYS, LIST_ONLY_FILTERS } from '../project.const';

export const isBoardView = (params: URLSearchParams) => params.get('view') === BOARD_VIEW;

export const isActiveFilter = (key: string, board: boolean) =>
  !(board && LIST_ONLY_FILTERS.includes(key));

export function toTaskQuery(params: URLSearchParams) {
  const board = isBoardView(params);
  const query = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const value = params.get(key);
    if (value && isActiveFilter(key, board)) query.set(key, value);
  }
  return query;
}
