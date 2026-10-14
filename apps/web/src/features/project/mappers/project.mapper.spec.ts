import { describe, expect, it } from 'vitest';
import type { ColumnVM } from '../../../shared/types/project.types';
import type { TaskVM } from '../../../shared/types/task.types';
import { placeTask, toColumnGroups, withColumn } from './column-group.mapper';
import { toTaskQuery } from './task-query.mapper';

const column = (id: string, category: ColumnVM['category'] = 'todo'): ColumnVM => ({
  id,
  name: id,
  category,
});
const task = (id: string, columnId: string) =>
  ({ id, column: { id: columnId, name: columnId } }) as TaskVM;

describe('toTaskQuery', () => {
  it('keeps list filters in list view', () => {
    const query = toTaskQuery(new URLSearchParams('columnId=c1&sort=title&q=x'));
    expect(query.toString()).toBe('columnId=c1&q=x&sort=title');
  });

  it('drops column and sort filters on the board', () => {
    const query = toTaskQuery(
      new URLSearchParams('view=board&columnId=c1&sort=title&priority=high'),
    );
    expect(query.toString()).toBe('priority=high');
  });
});

describe('toColumnGroups', () => {
  it('groups by column order and skips empty columns', () => {
    const groups = toColumnGroups(
      [task('a', 'c2'), task('b', 'c1')],
      [column('c1'), column('c2'), column('c3')],
      true,
    );
    expect(groups.map((g) => [g.column?.id, g.items.map((t) => t.id)])).toEqual([
      ['c1', ['b']],
      ['c2', ['a']],
    ]);
  });

  it('returns a single group when not grouped', () => {
    expect(toColumnGroups([task('a', 'c1')], [column('c1')], false)).toHaveLength(1);
  });
});

describe('placeTask', () => {
  const list = [task('a', 'c'), task('b', 'c'), task('c', 'c')];

  it('moves a task before another one', () => {
    expect(placeTask(list, 'c', 'a').map((t) => t.id)).toEqual(['c', 'a', 'b']);
  });

  it('moves a task to the end without target', () => {
    expect(placeTask(list, 'a', null).map((t) => t.id)).toEqual(['b', 'c', 'a']);
  });
});

describe('withColumn', () => {
  it('derives status and completion from the column category', () => {
    const moved = withColumn(task('a', 'c1'), column('c2', 'done'));
    expect(moved).toMatchObject({ column: { id: 'c2' }, status: 'done', isDone: true });
  });
});
