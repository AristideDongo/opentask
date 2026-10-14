# 0008 — Temps réel par Server-Sent Events

**Statut : acceptée**

## Contexte

La discussion interne (canaux) et le travail à plusieurs sur un même projet exigent que les changements apparaissent sans recharger la page. La communication n’a besoin que d’un sens serveur → navigateur : les écritures passent déjà par l’API REST.

## Décision

- Un flux **SSE** par workspace : `GET /api/v1/workspaces/:workspaceId/events` (`text/event-stream`). Le nom d’événement SSE est le `type` ; `data` suit le contrat `RealtimeEventSchema` (`packages/contracts/src/work.ts`).
- Les cas d’usage publient après validation de la transaction, via le port `Realtime` ; ils déclarent l’**audience** de chaque événement (rôle minimal et/ou liste d’utilisateurs). Un message d’un canal privé n’est envoyé qu’à ses membres explicites.
- Le hub (`apps/api/src/infrastructure/realtime-hub.ts`) connaît le rôle de chaque connexion. Un changement de rôle est appliqué à chaud ; un membre retiré voit son flux fermé immédiatement ; la suppression du workspace ferme tous les flux.
- Battement `ping` toutes les 25 s ; nginx désactive la mise en tampon sur cette route (`proxy_buffering off`, `X-Accel-Buffering: no`).
- Côté interface, `EventSource` se reconnecte seul. À chaque (re)connexion, les données affichées sont rechargées une fois : les événements survenus avant l’ouverture du flux ne sont pas rejoués. Les messages sont fusionnés localement par identifiant ; les autres événements déclenchent un rechargement des données de la page.

## Conséquences

- Pas de WebSocket, pas de dépendance supplémentaire ; fonctionne derrière tout proxy HTTP/1.1.
- **Une seule instance d’API** : le hub est en mémoire. Pour plusieurs instances, il faudra relayer les événements (PostgreSQL `LISTEN/NOTIFY` ou Redis) — le port `Realtime` isole ce changement.
- Chaque onglet ouvre une connexion longue ; en HTTP/1.1, les navigateurs limitent à 6 connexions par domaine (HTTP/2 via le proxy HTTPS lève cette limite).
