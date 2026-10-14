import { describe, expect, it } from 'vitest';
import { assertColumnCanBeDeleted, columnPosition, resolveColumn } from './column.helper';

const columns = [
  { id: 'a', name: 'À faire', category: 'todo' as const, position: 1024 },
  { id: 'b', name: 'En cours', category: 'in_progress' as const, position: 2048 },
  { id: 'c', name: 'Terminé', category: 'done' as const, position: 3072 },
];

describe('colonnes', () => {
  it('position d’insertion et de déplacement', () => {
    expect(columnPosition(columns, null)).toBe(4096);
    expect(columnPosition(columns, 'b')).toBe(1536);
    expect(columnPosition(columns, 'a')).toBe(0);
    expect(columnPosition(columns, 'a', 'c')).toBe(0);
    expect(() => columnPosition(columns, 'b', 'b')).toThrow();
    expect(() => columnPosition(columns, 'zz')).toThrow();
  });

  it('résout la colonne cible', () => {
    expect(resolveColumn(columns, { columnId: 'b' }).id).toBe('b');
    expect(resolveColumn(columns, { status: 'done' }).id).toBe('c');
    expect(resolveColumn(columns, {}).id).toBe('a');
    expect(() => resolveColumn(columns, { status: 'in_review' })).toThrow(/En revue/);
    expect(() => resolveColumn(columns, { columnId: 'x' })).toThrow();
  });

  it('suppression : jamais la dernière, destination obligatoire si non vide', () => {
    expect(() => assertColumnCanBeDeleted(columns.slice(0, 1), 'a', 0, null)).toThrow(
      /au moins une colonne/,
    );
    expect(() => assertColumnCanBeDeleted(columns, 'a', 2, null)).toThrow(/contient des tâches/);
    expect(() => assertColumnCanBeDeleted(columns, 'a', 2, 'a')).toThrow(/destination/);
    expect(assertColumnCanBeDeleted(columns, 'a', 2, 'c')?.id).toBe('c');
    expect(assertColumnCanBeDeleted(columns, 'a', 0, null)).toBeNull();
  });
});
