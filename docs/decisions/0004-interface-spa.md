# 0004 — Interface monopage servie sur la même origine que l’API

**Statut : acceptée**

## Contexte

React Router en mode Framework peut faire du rendu serveur (SSR) ou produire une application monopage. Le SSR imposerait un second serveur Node et la transmission des cookies entre l’interface et l’API.

## Décision

- `ssr: false` : le build produit des fichiers statiques et un `index.html`. Les données sont chargées par des `clientLoader`.
- L’interface et l’API partagent **la même origine** : `/api` est relayé par Vite en développement et par nginx en production. Pas de CORS ; les cookies de session restent simples et `SameSite=Lax`.
- Les formulaires utilisent React Hook Form avec les schémas Zod partagés.

## Conséquences

- Image web minimale (nginx, ~95 Mo) ; aucun secret côté interface.
- Pas de rendu serveur : premier affichage légèrement plus lent et pas de SEO, sans importance pour une application authentifiée.
- Le SSR pourra être activé plus tard sans changer l’API.
