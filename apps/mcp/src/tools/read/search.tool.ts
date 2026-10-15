import type { ProjectList } from '@opentask/contracts/projects/project';
import type { TaskList } from '@opentask/contracts/tasks/task';
import { z } from 'zod';
import { pageNote, paginate, taskLine, toTaskSummary } from '../../helpers/format.helper';
import { MAX_SEARCH_PROJECTS, UNTRUSTED_CONTENT_NOTE } from '../../helpers/limits.const';
import { defineTool } from '../tool.types';
import { limitInput, workspaceIdInput } from '../tool.inputs';

export const searchTool = defineTool({
  name: 'opentask_search',
  title: 'Rechercher',
  description: `Recherche des projets (par nom) et des tâches (par titre) dans un workspace accessible. Seuls les ${MAX_SEARCH_PROJECTS} premiers projets sont parcourus pour les tâches ; le résultat l’indique. ${UNTRUSTED_CONTENT_NOTE}`,
  access: 'read',
  inputSchema: {
    workspaceId: workspaceIdInput,
    query: z.string().trim().min(2).max(200).describe('Texte recherché (2 caractères minimum).'),
    limit: limitInput,
  },
  async run(client, { workspaceId, query, limit }) {
    const { items: projects } = await client.get<ProjectList>(
      `/workspaces/${workspaceId}/projects`,
    );
    const needle = query.toLocaleLowerCase();
    const matchingProjects = projects
      .filter((p) => p.name.toLocaleLowerCase().includes(needle))
      .map((p) => ({ id: p.id, name: p.name }));
    const scanned = projects.slice(0, MAX_SEARCH_PROJECTS);
    const results = await Promise.all(
      scanned.map((p) =>
        client.get<TaskList>(`/workspaces/${workspaceId}/projects/${p.id}/tasks`, { q: query }),
      ),
    );
    const tasks = results.flatMap((r) => r.items.map(toTaskSummary));
    const page = paginate(tasks, 0, limit);
    const partial = projects.length > scanned.length;
    return {
      summary: [
        `${matchingProjects.length} projets correspondants.`,
        pageNote(page, 'tâches'),
        ...(partial
          ? [
              `Recherche limitée aux ${MAX_SEARCH_PROJECTS} premiers projets sur ${projects.length}.`,
            ]
          : []),
        ...page.items.map(taskLine),
      ].join('\n'),
      data: { projects: matchingProjects, tasks: page.items, totalTasks: page.total, partial },
    };
  },
});
