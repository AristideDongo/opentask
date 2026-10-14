import { positionBetween } from '../../../shared/helpers/position.helper';
import {
  ColumnNotEmptyError,
  InvalidColumnDestinationError,
  InvalidColumnReferenceError,
  LastColumnError,
  MissingColumnCategoryError,
  NoColumnError,
  UnknownColumnError,
} from '../errors/project.errors';
import type { ColumnFact, ColumnTarget } from '../types/column.types';

export function columnPosition(
  columns: ColumnFact[],
  beforeColumnId: string | null,
  movingId?: string,
): number {
  const others = columns.filter((c) => c.id !== movingId);
  if (beforeColumnId === null) return positionBetween(others.at(-1)?.position ?? null, null);
  if (beforeColumnId === movingId) throw new InvalidColumnReferenceError();
  const index = others.findIndex((c) => c.id === beforeColumnId);
  if (index < 0) throw new InvalidColumnReferenceError();
  return positionBetween(others[index - 1]?.position ?? null, others[index]!.position);
}

export function resolveColumn<T extends ColumnFact>(columns: T[], target: ColumnTarget): T {
  if (target.columnId) {
    const column = columns.find((c) => c.id === target.columnId);
    if (!column) throw new UnknownColumnError();
    return column;
  }
  if (target.status) {
    const column = columns.find((c) => c.category === target.status);
    if (!column) throw new MissingColumnCategoryError(target.status);
    return column;
  }
  const first = columns[0];
  if (!first) throw new NoColumnError();
  return first;
}

export function assertColumnCanBeDeleted(
  columns: ColumnFact[],
  columnId: string,
  taskCount: number,
  moveTasksTo: string | null,
): ColumnFact | null {
  if (columns.length <= 1) throw new LastColumnError();
  if (taskCount > 0 && !moveTasksTo) throw new ColumnNotEmptyError();
  if (!moveTasksTo) return null;
  const destination = columns.find((c) => c.id === moveTasksTo && c.id !== columnId);
  if (!destination) throw new InvalidColumnDestinationError();
  return destination;
}
