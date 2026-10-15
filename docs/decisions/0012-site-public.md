# 0012 — Site public séparé de l’application

**Statut : acceptée**

## Contexte

OpenTask a besoin d’une page de présentation publique (fonctionnalités, installation, MCP, communauté). L’application `apps/web` est servie par chaque instance auto-hébergée : y placer une page marketing l’imposerait à la racine de toutes les installations.

## Décision

- Le site public vit dans `apps/site` : React Router en mode framework, **prérendu en HTML statique** (`/`, `/en`, `/404`, `sitemap.xml`, `robots.txt`), sans serveur Node. Il se déploie sur n’importe quel hébergement statique.
- Il utilise les composants de `packages/ui` (ADR 0010) et la même police que l’application.
- Toutes les URL publiques sont centralisées dans `src/shared/config/site.config.ts`. Les URL propres au déploiement sont lues au build : `VITE_SITE_URL` (URL canonique, Open Graph, sitemap), `VITE_DOCS_URL` (documentation), `VITE_DEMO_URL` (démo : le bouton n’apparaît que si elle existe). Sans ces variables, les liens pointent vers le dépôt GitHub et aucune URL canonique n’est publiée.
- Le contenu (français, anglais) est typé et testé : même structure dans les deux langues, aucun lien hors du dépôt ou de la configuration, statut explicite de chaque fonctionnalité (disponible, en développement, prévu).
- Ni cookie ni outil de mesure d’audience.

## Conséquences

- Les tests du site (`pnpm --filter @opentask/site test`) contrôlent les pages prérendues : la tâche `test` dépend du `build` (`apps/site/turbo.json`).
- Le domaine de publication reste à choisir ; aucun workflow de déploiement n’est ajouté tant qu’il n’est pas connu.
