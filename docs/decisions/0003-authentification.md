# 0003 — Authentification par better-auth, sessions par cookie

**Statut : acceptée**

## Contexte

La spécification impose better-auth, demande Argon2id, des cookies `HttpOnly`/`Secure`/`SameSite`, la vérification d’adresse, la réinitialisation du mot de passe et une limitation de débit.

## Décision

- better-auth est monté sur `/api/v1/auth/*` devant le parseur JSON de NestJS, avec l’adaptateur Prisma. Ses tables (`users`, `sessions`, `accounts`, `verifications`) font partie du schéma Prisma et des migrations.
- Les mots de passe sont hachés en **Argon2id** (`@node-rs/argon2`, paramètres OWASP : 19 Mio, 2 itérations).
- Sessions par cookie `opentask.session_token` (`HttpOnly`, `SameSite=Lax`, `Secure` dès que `PUBLIC_URL` est en HTTPS), durée 30 jours, renouvellement quotidien, révocation de toutes les sessions lors d’une réinitialisation de mot de passe.
- La vérification d’adresse est **configurable** (`REQUIRE_EMAIL_VERIFICATION`) : désactivée par défaut pour qu’une instance de test fonctionne sans SMTP, recommandée en production.
- Limitation de débit better-auth par IP. L’IP est calculée par Express selon `TRUST_PROXY_HOPS` puis transmise dans un en-tête interne que l’API réécrit toujours : un client ne peut ni l’usurper ni faire partager un compteur global à tous les utilisateurs.
- Les routes OpenTask vérifient la session dans un garde global (`SessionGuard`). Toute route est protégée sauf si elle est marquée `@Public()`.

## Conséquences

- Les routes d’authentification suivent le format de better-auth (`/sign-up/email`, `/sign-in/email`…) plutôt que les exemples `/auth/register` de la spécification ; elles sont documentées dans le registre des contrats et l’OpenAPI.
- La limitation de débit est en mémoire : avec plusieurs instances d’API, il faudra un stockage partagé (base ou Redis).
- SSO et OAuth sont possibles plus tard via les plugins better-auth.
