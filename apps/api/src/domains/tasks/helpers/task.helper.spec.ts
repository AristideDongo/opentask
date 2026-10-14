import { describe, expect, it } from 'vitest';
import { assertTaskReferencesAreValid, completionDate } from './task.helper';

const now = new Date('2026-05-01T10:00:00Z');
const earlier = new Date('2026-04-01T10:00:00Z');
const facts = { columns: [], parent: null, assigneeIsMember: true, existingLabelIds: ['l1', 'l2'] };

describe('tâches', () => {
  it('date d’achèvement : posée, conservée, effacée', () => {
    expect(completionDate('todo', 'done', null, now)).toEqual(now);
    expect(completionDate('done', 'done', earlier, now)).toEqual(earlier);
    expect(completionDate('done', 'in_progress', earlier, now)).toBeNull();
  });

  it('sous-tâches : même projet, un seul niveau', () => {
    const input = { projectId: 'p', parentId: 't' };
    expect(() =>
      assertTaskReferencesAreValid(input, { ...facts, parent: { projectId: 'p', parentId: null } }),
    ).not.toThrow();
    expect(() =>
      assertTaskReferencesAreValid(input, { ...facts, parent: { projectId: 'q', parentId: null } }),
    ).toThrow(/même projet/);
    expect(() =>
      assertTaskReferencesAreValid(input, { ...facts, parent: { projectId: 'p', parentId: 'x' } }),
    ).toThrow(/elle-même/);
    expect(() => assertTaskReferencesAreValid(input, facts)).toThrow(/parente introuvable/);
  });

  it('assigné membre et tags du projet, sans doublon', () => {
    expect(() =>
      assertTaskReferencesAreValid(
        { projectId: 'p', assigneeId: 'u' },
        { ...facts, assigneeIsMember: false },
      ),
    ).toThrow();
    expect(assertTaskReferencesAreValid({ projectId: 'p', labelIds: ['l1', 'l1'] }, facts)).toEqual(
      ['l1'],
    );
    expect(() => assertTaskReferencesAreValid({ projectId: 'p', labelIds: ['zz'] }, facts)).toThrow(
      /tags/,
    );
  });
});
