import type { Project } from '@opentask/contracts/projects/project';
import type { TaskList } from '@opentask/contracts/tasks/task';
import { isOverdue, todayIso } from '../../helpers/format.helper';
import { defineTool } from '../tool.types';
import { projectIdInput, workspaceIdInput } from '../tool.inputs';

export const getProjectSummaryTool = defineTool({
  name: 'opentask_get_project_summary',
  title: 'Résumé d’un projet',
  description:
    'Résumé factuel d’un projet accessible : tâches par colonne, terminées, en retard, sans personne assignée, et prochaines échéances. Calculé à partir des données, sans interprétation.',
  access: 'read',
  inputSchema: { workspaceId: workspaceIdInput, projectId: projectIdInput },
  async run(client, { workspaceId, projectId }) {
    const base = `/workspaces/${workspaceId}/projects/${projectId}`;
    const [project, { items }] = await Promise.all([
      client.get<Project>(base),
      client.get<TaskList>(`${base}/tasks`),
    ]);
    const today = todayIso();
    const open = items.filter((task) => task.status !== 'done');
    const byColumn = project.columns.map((column) => ({
      column: column.name,
      category: column.category,
      count: items.filter((task) => task.column.id === column.id).length,
    }));
    const upcoming = open
      .filter((task) => task.dueDate && task.dueDate >= today)
      .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
      .slice(0, 5)
      .map((task) => ({ id: task.id, title: task.title, dueDate: task.dueDate }));
    const summary = {
      project: { id: project.id, name: project.name, team: project.team?.name ?? null },
      total: items.length,
      done: items.length - open.length,
      overdue: open.filter((task) => isOverdue(task, today)).length,
      unassigned: open.filter((task) => !task.assignee).length,
      byColumn,
      upcoming,
      today,
    };
    return {
      summary: `${project.name} : ${summary.done}/${summary.total} tâches terminées, ${summary.overdue} en retard, ${summary.unassigned} ouvertes sans personne assignée.`,
      data: summary,
    };
  },
});
