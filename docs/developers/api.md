# API REST

## Vue d’ensemble

- Préfixe : `/api/v1` (versionné dans l’URL).
- Document OpenAPI 3.0 généré depuis les contrats Zod de `packages/contracts` : [openapi.json](https://github.com/AristideDongo/opentask/blob/main/docs/api/openapi.json), également servi par chaque instance sur `GET /api/v1/openapi.json`.
- Les contrats Zod sont la source de vérité : l’API valide chaque entrée et chaque réponse avec eux.

## Authentification

| Méthode           | Usage                      | Comment                                                                         |
| ----------------- | -------------------------- | ------------------------------------------------------------------------------- |
| Cookie de session | Navigateur, interface web  | `POST /api/v1/auth/sign-in/email` ; cookie `opentask.session_token` (HttpOnly). |
| Jeton d’API       | Scripts, intégrations, MCP | `Authorization: Bearer otk_…` ([créer un jeton](../user/api-tokens.md)).        |

Avec un jeton, la permission `read` autorise les requêtes `GET` et `write` toutes les autres. La gestion des jetons (`/me/api-tokens`) exige une session. Les requêtes modifiantes envoyées par un navigateur doivent provenir de `PUBLIC_URL` (en-tête `Origin`).

## Exemple TypeScript

```ts
const OPENTASK_URL = 'https://taches.example.org';
const token = process.env.OPENTASK_TOKEN;

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${OPENTASK_URL}/api/v1${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      ...init.headers,
    },
  });
  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(`${error.code}: ${error.message}`);
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

const { items: workspaces } = await api<{ items: { id: string; name: string }[] }>('/workspaces');
const workspaceId = workspaces[0].id;
const { items: tasks } = await api<{ items: { title: string }[] }>(
  `/workspaces/${workspaceId}/my-tasks`,
);
console.log(tasks.map((t) => t.title));
```

## Pagination, filtres et tri

- Le journal d’audit et les messages sont paginés par curseur : `?limit=` (1 à 100, 50 par défaut) et `?cursor=` (valeur `nextCursor` de la page précédente).
- Les tâches d’un projet se filtrent par `status`, `columnId`, `priority`, `assigneeId` (ou `none`), `labelId`, `q` (titre) et se trient par `sort` : `position`, `dueDate`, `priority`, `createdAt`, `title`.

## Erreurs

Format stable : `{ "error": { "code", "message", "details"?, "requestId" } }`. Codes : `VALIDATION_FAILED` (400), `UNAUTHENTICATED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404, y compris pour une ressource existante mais inaccessible), `CONFLICT` (409), `INVITATION_INVALID` (410), `RATE_LIMITED` (429), `INTERNAL_ERROR` (500). Voir [l’architecture](../architecture/overview.md#erreurs).

## Limitation de débit

300 requêtes par minute et par adresse IP pour l’API ; limites plus strictes sur la connexion, l’inscription et la réinitialisation de mot de passe. Réponse `429` au-delà.

## Webhooks

Pas encore disponibles ([feuille de route](../product/roadmap.md)).
