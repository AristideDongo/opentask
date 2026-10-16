# 0014 — Landing page et documentation servies par l’application

**Statut : acceptée** — remplace [0012](0012-site-public.md) et [0013](0013-documentation-vitepress.md).

## Contexte

Les responsables du projet veulent qu’OpenTask s’ouvre sur une page d’accueil présentant le produit, avec les boutons de connexion et d’inscription, et que la documentation — dont le guide MCP — soit consultable sur la même adresse que l’application. Le site public (`apps/site`) et le site de documentation (`apps/docs`) séparés dupliquaient le contenu et le déploiement.

## Décision

- `apps/web` sert trois espaces : la **landing page** sur `/`, la **documentation** sur `/docs`, l’**application** sur `/app` (les écrans d’un workspace restent sous `/w/…`).
- La landing page et la documentation sont **prérendues en HTML statique** au build (`prerender` de React Router) ; le reste de l’application reste une SPA. nginx sert la page prérendue si elle existe, sinon `__spa-fallback.html`.
- La documentation est rendue depuis les fichiers Markdown de `docs/` (source unique) avec `marked` (MIT, sans dépendance) : liens relatifs `.md` réécrits en routes `/docs/…`, ancres de titres, encadrés `::: warning`, tableaux. La recherche s’appuie sur un index généré au build (`/docs/search.json`). Un test vérifie chaque lien interne, chaque ancre et la barre latérale.
- Un visiteur connecté voit « Ouvrir l’application » à la place de « Se connecter » / « Créer un compte ». Après connexion, l’utilisateur arrive sur `/app`.
- Palette « Mermaid Dreams » (du turquoise `#41c0bf` au bleu marine `#234f88`) : jetons `--brand-1` à `--brand-10` ; les actions utilisent `#1c6799` (contraste 6,1 avec le blanc) en clair et `#25b9c4` en sombre.

## Conséquences

- Chaque instance auto-hébergée affiche la landing page à sa racine ; elle présente le projet et mène à la connexion.
- `apps/site` et `apps/docs` sont supprimés ; VitePress n’est plus une dépendance.
