import type { Me } from '@opentask/contracts/me/profile';
import { defineTool } from '../tool.types';

export const getCurrentUserTool = defineTool({
  name: 'opentask_get_current_user',
  title: 'Utilisateur connecté',
  description:
    'Retourne le profil minimal de l’utilisateur OpenTask associé au jeton (identifiant, nom, langue, fuseau horaire).',
  access: 'read',
  inputSchema: {},
  async run(client) {
    const me = await client.get<Me>('/me');
    return {
      summary: `Connecté en tant que ${me.name}.`,
      data: { id: me.id, name: me.name, locale: me.locale, timezone: me.timezone },
    };
  },
});
