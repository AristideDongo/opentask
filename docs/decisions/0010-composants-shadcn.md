# 0010 — Composants d’interface partagés : shadcn/ui dans `packages/ui`

**Statut : acceptée**

## Contexte

L’équipe veut un socle de composants accessibles et cohérents, réutilisable par l’application et par le site public. shadcn/ui copie le code source des composants dans le dépôt (pas de dépendance opaque) et s’appuie sur Radix et Tailwind, déjà utilisés.

## Décision

- Les composants sont générés avec la CLI shadcn dans `packages/ui` (`components.json`, style `new-york`), exportés par fichier : `@opentask/ui/components/button`, `@opentask/ui/lib/utils`, `@opentask/ui/hooks/use-mobile`, `@opentask/ui/globals.css`.
- Ajout ou mise à jour d’un composant : `npx shadcn@latest add <nom> -c packages/ui`. `add --all` échoue actuellement car l’index du registre référence `questionnaire` et `toast`, absents du style (`404`) ; `sonner` remplace `toast`.
- Le thème (`src/styles/globals.css`) reprend la palette OpenTask (vert « pin ») en clair et en sombre, compatible avec `.dark` et `[data-theme='dark']`.
- Les dépendances sont épinglées en version exacte, comme dans le reste du dépôt. La CLI a ajouté par erreur le paquet npm `cn` (sans rapport) en résolvant mal l’alias `utils` : il a été retiré et les imports pointent vers `@opentask/ui/lib/utils`. Vérifier ce point après chaque `shadcn add`.

## Conséquences

- Le site public consomme `packages/ui` dès sa création.
- L’application (`apps/web`) a ses propres jetons (`text-muted` = couleur de texte, `bg-accent` = vert franc) dont les noms entrent en collision avec ceux de shadcn (`muted` = fond, `accent` = fond doux). Elle migre écran par écran : chaque écran migré importe les composants de `packages/ui`, et les jetons de l’application seront renommés dans une PR dédiée avant l’import global du thème shadcn.
