import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

const workspaceId = z.string().min(1).max(64).describe('Identifiant du workspace.');

const userMessage = (text: string) => ({
  messages: [{ role: 'user' as const, content: { type: 'text' as const, text } }],
});

const READ_ONLY =
  'N’effectue aucune modification. Si une information manque, dis-le au lieu de l’inventer.';

export function registerPrompts(server: McpServer) {
  server.registerPrompt(
    'opentask_weekly_review',
    {
      title: 'Revue hebdomadaire',
      description: 'Revue de la semaine à partir de mes tâches OpenTask.',
      argsSchema: { workspaceId },
    },
    ({ workspaceId: id }) =>
      userMessage(
        `Fais ma revue hebdomadaire dans le workspace ${id}. Utilise opentask_list_my_tasks pour lister mes tâches ouvertes, puis présente : les tâches en retard, celles dues dans les 7 prochains jours, et celles sans échéance. ${READ_ONLY}`,
      ),
  );
  server.registerPrompt(
    'opentask_project_status',
    {
      title: 'Avancement d’un projet',
      description: 'Compte rendu factuel de l’avancement d’un projet.',
      argsSchema: {
        workspaceId,
        projectId: z.string().min(1).max(64).describe('Identifiant du projet.'),
      },
    },
    ({ workspaceId: id, projectId }) =>
      userMessage(
        `Rédige un compte rendu d’avancement du projet ${projectId} (workspace ${id}). Utilise opentask_get_project_summary, puis opentask_list_tasks pour détailler les tâches en retard. Cite les chiffres tels qu’ils sont retournés. ${READ_ONLY}`,
      ),
  );
  server.registerPrompt(
    'opentask_overdue_tasks',
    {
      title: 'Tâches en retard',
      description: 'Résumé de mes tâches en retard.',
      argsSchema: { workspaceId },
    },
    ({ workspaceId: id }) =>
      userMessage(
        `Liste mes tâches en retard dans le workspace ${id} avec opentask_list_my_tasks (overdueOnly à true), regroupées par projet, avec leur échéance. ${READ_ONLY}`,
      ),
  );
}
