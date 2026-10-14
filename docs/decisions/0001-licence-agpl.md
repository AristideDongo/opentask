# 0001 — Licence AGPL-3.0-only

**Statut : proposée** — à confirmer par les responsables du projet avant la première publication publique (§ 22 de la spécification).

## Contexte

La spécification hésite entre AGPL-3.0 (préserve les libertés des utilisateurs d’un service réseau) et Apache-2.0 (permissive, facilite les services propriétaires dérivés). Le principe produit n° 9 veut que les éventuelles offres payantes portent sur l’exploitation, pas sur les fonctions essentielles.

## Décision

Le code est publié sous **AGPL-3.0-only**. L’interface affiche un lien « Code source » configurable (`SOURCE_URL`) pour respecter l’article 13 lorsqu’une instance est proposée en réseau.

## Conséquences

- Un tiers qui propose une version modifiée d’OpenTask comme service doit en publier les sources : le cœur reste ouvert.
- Certaines entreprises évitent l’AGPL : l’adoption par des intégrateurs propriétaires peut être freinée.
- Toutes les dépendances doivent avoir une licence compatible (MIT, ISC, Apache-2.0, BSD, MPL-2.0, OFL pour la police). C’est le cas à ce jour ; la vérification fait partie de la revue de toute nouvelle dépendance.
- Ce document ne constitue pas un avis juridique.
