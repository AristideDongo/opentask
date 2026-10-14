import type { Column } from '@opentask/contracts/projects/column';
import type { Label } from '@opentask/contracts/projects/label';
import type { Project } from '@opentask/contracts/projects/project';
import type { ColumnVM, LabelVM, ProjectVM } from '../types/project.types';
import { readableTextColor } from '../utils/color';

export const toLabelVM = (l: Label): LabelVM => ({ ...l, textColor: readableTextColor(l.color) });

export const toColumnVM = (c: Column): ColumnVM => ({
  id: c.id,
  name: c.name,
  category: c.category,
});

export const toProjectVM = (p: Project): ProjectVM => ({
  id: p.id,
  name: p.name,
  description: p.description,
  team: p.team,
  labels: p.labels.map(toLabelVM),
  columns: p.columns.map(toColumnVM),
  progress: {
    done: p.taskCounts.done ?? 0,
    total: Object.values(p.taskCounts).reduce((a, b) => a + b, 0),
  },
});
