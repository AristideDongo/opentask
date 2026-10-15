# Dépannage

Voir aussi le dépannage [utilisateur](./user/troubleshooting.md) et [MCP](./mcp/troubleshooting.md).

| Symptôme                                          | Cause probable et solution                                                                                                            |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `EADDRINUSE` / port déjà utilisé                  | Un autre processus occupe `4000` (API), `5173` (interface) ou `8080` (conteneur web) : arrêtez-le ou changez `API_PORT` / `WEB_PORT`. |
| « Configuration invalide » au démarrage de l’API  | Une variable manque ou est invalide ; le message la nomme. Voir [la configuration](./admin/configuration.md).                         |
| `AUTH_SECRET utilise encore la valeur d’exemple`  | Générez un secret : `openssl rand -base64 48`.                                                                                        |
| `P1001: Can't reach database server`              | PostgreSQL n’est pas démarré ou `DATABASE_URL` est faux. En développement : `pnpm db:up`.                                             |
| Migration en échec au démarrage                   | Lisez les logs de l’API ; restaurez la dernière sauvegarde si la base est dans un état incohérent, puis signalez le problème.         |
| Le conteneur `api` redémarre en boucle            | `docker compose … logs api` : configuration invalide ou base injoignable dans la plupart des cas.                                     |
| Les e-mails ne partent pas                        | `SMTP_URL` absent ou invalide (identifiants, port, `smtps://` pour le port 465).                                                      |
| Limitation de débit incohérente derrière un proxy | `TRUST_PROXY_HOPS` ne correspond pas au nombre de proxys (2 avec le profil `https`).                                                  |
