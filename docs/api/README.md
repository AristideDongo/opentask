# API

- Document OpenAPI 3.0 : [openapi.json](openapi.json), généré depuis `packages/contracts` (`pnpm openapi`) et servi par l’API sur `GET /api/v1/openapi.json`.
- Authentification : cookie de session obtenu via `POST /api/v1/auth/sign-in/email`.
- Les requêtes modifiantes envoyées par un navigateur doivent provenir de `PUBLIC_URL` (en-tête `Origin`).
- Erreurs : `{ "error": { "code", "message", "details"?, "requestId" } }` ; codes décrits dans [l’architecture](../architecture/overview.md#erreurs).

Exemple :

```sh
curl -c cookies.txt -H 'content-type: application/json' \
  -d '{"email":"alice@example.org","password":"…"}' http://localhost:5173/api/v1/auth/sign-in/email
curl -b cookies.txt http://localhost:5173/api/v1/workspaces
```
