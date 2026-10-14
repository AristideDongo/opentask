import { type Column, ColumnSchema } from '@opentask/contracts/projects/column';
import { type Label, LabelSchema } from '@opentask/contracts/projects/label';
import { type Project, ProjectSchema } from '@opentask/contracts/projects/project';
import type { ProjectRow } from '../repository/project.repository';

export const toColumnDto = (c: Column): Column => ColumnSchema.parse(c);

export const toLabelDto = (l: Label): Label => LabelSchema.parse(l);

export const toProjectDto = (p: ProjectRow): Project =>
  ProjectSchema.parse({
    id: p.id,
    name: p.name,
    description: p.description,
    team: p.team,
    labels: p.labels,
    columns: p.columns,
    taskCounts: p.taskCounts,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  });
