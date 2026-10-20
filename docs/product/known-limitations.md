# Limites connues

Version 0.2.0. Ces limites sont assumées et seront levées selon la [feuille de route](roadmap.md).

## Fonctionnelles

- Pas de vue Calendrier ni Gantt ; pas de champs personnalisés ni de dépendances entre tâches.
- Les tags sont propres à chaque projet : pas encore de tags partagés par tout le workspace.
- Les colonnes se réordonnent par le menu « … » (gauche/droite), pas encore par glisser-déposer.
- Les équipes ne restreignent pas l’accès aux projets : tout membre voit tous les projets du workspace.
- Discussion : pas encore de messages directs (utilisez un canal privé à deux), de fils de réponse, de réactions ni d’indicateur « en train d’écrire ».
- Notifications : seules les mentions `@` préviennent, en direct et uniquement si la personne a l’application ouverte ; pas d’historique, de notification par e-mail ni d’alerte d’assignation ou d’échéance.
- Fichiers : stockés sur le disque du serveur de l’API (pas encore de stockage S3) ; pas d’aperçu des PDF ni de renommage ; un fichier préparé dans un canal mais jamais envoyé reste sur le disque jusqu’au prochain envoi de la même personne, au moins 24 h plus tard.
- Pas d’export de données depuis l’interface ; la sauvegarde PostgreSQL est la seule méthode d’extraction.
- Pas de suppression de compte utilisateur ni de changement d’adresse e-mail.
- Les messages d’erreur métier renvoyés par l’API sont en français ; l’interface anglaise traduit les erreurs génériques par code.
- L’inscription signale qu’une adresse est déjà utilisée (comportement standard de better-auth).

## Techniques

- **Une seule instance d’API** : limitation de débit, file d’e-mails et diffusion temps réel sont en mémoire ([ADR 0005](../decisions/0005-pas-de-worker-au-mvp.md), [ADR 0008](../decisions/0008-temps-reel-sse.md)).
- Un onglet ouvert = une connexion SSE ; derrière un proxy HTTP/1.1 sans HTTP/2, un navigateur est limité à 6 connexions par domaine.
- La recherche porte sur les titres de tâches (pas sur les descriptions, commentaires ni messages).
- Le glisser-déposer du Kanban utilise l’API HTML5 (souris) ; sur écran tactile et au clavier, on change la colonne avec le sélecteur de statut de chaque carte.
- L’image Docker de l’API pèse environ 800 Mo (CLI Prisma embarqué pour les migrations).
- La suppression d’un workspace efface aussi son journal d’audit ; aucun test de charge n’a été réalisé.
