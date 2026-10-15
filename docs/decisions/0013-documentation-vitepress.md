# 0013 — Site de documentation avec VitePress

**Statut : acceptée**

## Contexte

La documentation existait déjà en Markdown dans `docs/` (architecture, déploiement, sécurité, ADR). Il fallait la rendre navigable et recherchable, ajouter les guides utilisateur, administrateur, API et MCP, et vérifier les liens en CI, sans dupliquer le contenu.

## Décision

- **VitePress 1.6.4** (MIT), dans `apps/docs`, avec `srcDir` pointant sur le dossier `docs/` du dépôt : une seule source, lisible sur GitHub comme sur le site, révisable par pull request.
- Recherche locale intégrée (aucun service externe) ; navigation et barre latérale déclarées dans `apps/docs/.vitepress/config.mts`.
- **Contrôle des liens** : VitePress fait échouer le build en cas de lien interne cassé. Le build fait partie de `pnpm build`, donc de la CI.
- Les fichiers `README.md` de `docs/decisions` et `docs/api` sont servis comme pages d’index (`rewrites`).
- Le paquet n’ajoute pas `vue` en dépendance directe : VitePress fournit le sien, et un alias Vite le rend résolvable depuis `docs/`, situé hors du paquet.

## Alternatives écartées

- **Docusaurus** : React comme le reste de l’interface, mais plus lourd pour un site de documentation pur.
- **Pages dans `apps/site`** : il aurait fallu développer recherche, barre latérale et contrôle des liens.

## Conséquences

- VitePress repose sur Vue : un second écosystème d’interface, limité à l’outil de documentation et sans code applicatif.
- Les schémas sont écrits en texte dans les pages (lisibles sur GitHub comme sur le site). Mermaid n’est pas activé : le greffon et sa dépendance pèsent lourd pour un besoin encore limité.
- Hébergement : site statique (`apps/docs/dist`). L’URL publique, une fois choisie, se renseigne dans `VITE_DOCS_URL` pour le site public.
