# Connecter Claude Code

Prérequis : un [jeton d’API](../user/api-tokens.md) (lecture seule, ou lecture et écriture) et [Claude Code](https://code.claude.com/docs/en/mcp).

## Option 1 — serveur local (stdio)

Le serveur tourne sur votre poste et appelle votre instance OpenTask. Cette option fonctionne même si l’instance n’est accessible que depuis votre réseau.

1. Construisez le serveur MCP depuis le dépôt :

   ```sh
   git clone https://github.com/AristideDongo/opentask.git
   cd opentask
   pnpm install
   pnpm --filter @opentask/mcp build
   ```

2. Ajoutez-le à Claude Code (remplacez l’URL et le chemin) :

   ```sh
   claude mcp add --transport stdio \
     --env OPENTASK_URL=https://taches.example.org \
     --env OPENTASK_TOKEN=otk_votre_jeton \
     opentask -- node /chemin/vers/opentask/apps/mcp/dist/stdio.js
   ```

   Ajoutez `--env MCP_ALLOW_WRITE=false` pour n’autoriser que la lecture, quelles que soient les permissions du jeton.

Le serveur écrit ses journaux sur la sortie d’erreur ; la sortie standard est réservée au protocole.

## Option 2 — serveur distant (HTTP)

Si l’administrateur a activé le serveur MCP de l’instance (`--profile mcp`) :

```sh
claude mcp add --transport http opentask https://taches.example.org/mcp \
  --header "Authorization: Bearer otk_votre_jeton"
```

Pour ne pas écrire le jeton en clair dans un fichier partagé, utilisez un fichier `.mcp.json` de projet avec une variable d’environnement :

```json
{
  "mcpServers": {
    "opentask": {
      "type": "http",
      "url": "https://taches.example.org/mcp",
      "headers": { "Authorization": "Bearer ${OPENTASK_TOKEN}" }
    }
  }
}
```

## Vérifier

Dans Claude Code, `/mcp` liste les serveurs connectés. Demandez ensuite : « Liste mes workspaces OpenTask ». L’assistant appelle `opentask_list_workspaces`.

## Exemples de demandes

- « Liste mes tâches en retard dans le workspace Acme. »
- « Résume l’avancement du projet Site web. »
- « Crée une tâche “Préparer la démo” en priorité haute dans le projet Site web. »
- « Déplace cette tâche dans la colonne Terminé et ajoute le commentaire “Livré”. »

Claude Code demande confirmation avant d’appeler un outil d’écriture selon vos réglages de permissions ; le serveur vérifie de toute façon chaque appel.
