import { describe, expect, it } from 'vitest';
import { clip, isOverdue, pageNote, paginate } from './format.helper';

describe('paginate', () => {
  const items = Array.from({ length: 30 }, (_, i) => i);

  it('returns a page and the next offset', () => {
    const page = paginate(items, 0, 25);
    expect(page.items).toHaveLength(25);
    expect(page.nextOffset).toBe(25);
    expect(pageNote(page, 'tâches')).toContain('offset=25');
  });

  it('signals the last page', () => {
    const page = paginate(items, 25, 25);
    expect(page.items).toEqual([25, 26, 27, 28, 29]);
    expect(page.nextOffset).toBeNull();
    expect(pageNote(page, 'tâches')).toBe('30 tâches au total.');
  });
});

describe('clip', () => {
  it('truncates long text with an ellipsis', () => {
    expect(clip('abcdef', 3)).toBe('abc…');
    expect(clip('abc', 3)).toBe('abc');
  });
});

describe('isOverdue', () => {
  it('only flags open tasks past their due date', () => {
    expect(isOverdue({ dueDate: '2026-10-01', status: 'todo' }, '2026-10-14')).toBe(true);
    expect(isOverdue({ dueDate: '2026-10-01', status: 'done' }, '2026-10-14')).toBe(false);
    expect(isOverdue({ dueDate: '2026-10-14', status: 'todo' }, '2026-10-14')).toBe(false);
    expect(isOverdue({ dueDate: null, status: 'todo' }, '2026-10-14')).toBe(false);
  });
});
