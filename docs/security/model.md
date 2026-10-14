# Modèle de sécurité

## Authentification

- Mots de passe : 10 à 128 caractères, hachés en Argon2id (19 Mio, t=2, p=1). Jamais journalisés.
- Sessions : cookie `opentask.session_token`, `HttpOnly`, `SameSite=Lax`, `Secure` en HTTPS ; 30 jours ; toutes les sessions sont révoquées lors d’une réinitialisation de mot de passe.
- Limitation de débit par IP : connexion 10/min, inscription 5/min, réinitialisation et renvoi de vérification 5 par 5 min ; 100/min sur les autres routes d’authentification ; 300/min sur l’API, 20/min sur la création d’invitations, 30/min sur les liens d’invitation.
- La demande de réinitialisation ne révèle pas si un compte existe.

## Autorisations

- Toutes les routes exigent une session, sauf celles marquées `@Public()` : health checks, OpenAPI, aperçu d’invitation (qui exige de posséder le jeton).
- Les contrôles sont faits dans les cas d’usage (voir [ADR 0006](../decisions/0006-roles-et-isolation.md)). L’interface masque les actions interdites par confort, pas par sécurité.
- Un non-membre ne peut pas distinguer un workspace inexistant d’un workspace inaccessible (`404` identique).

## Protections HTTP

- CSRF : cookies `SameSite=Lax`, et refus (403) de toute requête modifiante dont l’en-tête `Origin` diffère de `PUBLIC_URL` ou marquée `Sec-Fetch-Site: cross-site`. better-auth applique son propre contrôle d’origine.
- En-têtes : helmet sur l’API (CSP stricte, `nosniff`, HSTS…) ; nginx ajoute `X-Frame-Options: DENY` et `Referrer-Policy` pour l’interface ; Caddy ajoute HSTS.
- Corps JSON limités à 1 Mo (2 Mo côté nginx). Entrées validées par les schémas Zod partagés ; requêtes SQL paramétrées par Prisma.
- L’interface React échappe tout contenu par défaut ; aucun HTML fourni par l’utilisateur n’est interprété.

## Secrets et logs

- Secrets uniquement dans l’environnement (`.env` et `.env.prod` sont ignorés par Git). La configuration est validée au démarrage ; en production, l’API refuse le secret d’exemple.
- Logs : cookies, en-tête `Authorization`, champs `password`/`token` et jetons présents dans les URL (invitations, vérification, réinitialisation) sont masqués. Les liens d’e-mail ne sont écrits dans les logs qu’en l’absence de SMTP **et** hors production.
- Jetons d’invitation : 256 bits aléatoires, seul le SHA-256 est stocké.

## Conteneurs

- L’API tourne sous un utilisateur non privilégié. PostgreSQL et l’API ne sont pas exposés hors du réseau Docker ; `web` est publié sur `127.0.0.1` par défaut.

## Chaîne d’approvisionnement

- Versions exactes épinglées et lockfile figé en CI (`--frozen-lockfile`). pnpm refuse les versions publiées trop récemment, et seuls `esbuild` et Prisma peuvent exécuter des scripts d’installation.
- CI : `pnpm audit` (gravité haute), gitleaks (secrets), Dependabot.

## Hors périmètre actuel

- Authentification à deux facteurs, SSO : non disponibles.
- Limitation de débit en mémoire : par instance d’API.
- Pas encore d’endpoint d’export ni de suppression de compte (voir [limites connues](../product/known-limitations.md)).
