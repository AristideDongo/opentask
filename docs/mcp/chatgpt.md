# ChatGPT

::: warning Pas encore pris en charge
OpenTask ne peut pas encore être connecté à ChatGPT.
:::

## Pourquoi

D’après la [documentation d’OpenAI](https://help.openai.com/en/articles/12584461-developer-mode-and-mcp-apps-in-chatgpt) consultée le 15 octobre 2026 :

- ChatGPT ne se connecte qu’à des serveurs MCP **distants**, accessibles en HTTPS ;
- le mode développeur qui permet d’ajouter un serveur personnalisé n’accepte qu’une authentification **OAuth** ou aucune authentification ;
- l’accès complet (lecture et écriture) est réservé à certaines offres (Business, Enterprise, Edu) et doit être activé par l’administrateur de l’espace de travail.

Le serveur MCP d’OpenTask authentifie aujourd’hui les requêtes par jeton d’API (`Authorization: Bearer`). Il ne fournit pas encore de serveur d’autorisation OAuth, et un serveur sans authentification exposerait les données : ce n’est pas envisageable.

## Ce qui est prévu

Ajouter un serveur d’autorisation OAuth 2.1 avec une solution maintenue (`@better-auth/oauth-provider`, de la même famille que la bibliothèque d’authentification d’OpenTask), puis tester le parcours complet dans ChatGPT avant de documenter la procédure. Suivez l’avancement dans les [issues](https://github.com/AristideDongo/opentask/issues).
