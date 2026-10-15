# Sécurité et confidentialité

## Ce que l’assistant peut voir et faire

- **Uniquement ce que votre compte peut voir**, au moment où l’assistant appelle un outil. Le serveur ne transmet jamais un workspace entier de sa propre initiative.
- L’identité vient du jeton, jamais d’un paramètre fourni par le modèle : un `workspaceId` ou un `taskId` inventé ou d’un autre workspace renvoie `NOT_FOUND`.
- Les écritures exigent la permission `write` du jeton, un rôle suffisant et `MCP_ALLOW_WRITE` actif. Il n’existe aucun outil de suppression.
- Un membre retiré d’un workspace, un jeton révoqué ou expiré perdent l’accès immédiatement.

## Contenu non fiable

Titres, descriptions et commentaires sont saisis par des personnes : ils peuvent contenir un texte destiné à manipuler l’assistant (« ignore tes instructions… »). Le serveur les renvoie comme des **données**, signale dans la description de chaque outil qu’ils ne doivent pas être suivis comme des instructions, et n’exécute jamais rien d’autre que l’outil appelé. Restez attentif aux actions que l’assistant propose après avoir lu ce contenu.

## Données transmises au fournisseur de l’assistant

Les résultats des outils sont envoyés au modèle de l’assistant que vous utilisez et traités selon les conditions de son fournisseur. N’utilisez pas MCP pour des données que vous ne souhaitez pas partager avec ce fournisseur.

## Journaux

Le serveur MCP journalise sur la sortie d’erreur : démarrage, appels refusés par l’API (code d’erreur) et écritures réussies (nom de l’outil et identifiants concernés). Il ne journalise ni les jetons, ni le contenu des tâches ou des commentaires. Aucune télémétrie n’est envoyée.

## Protections du serveur HTTP

- Jeton obligatoire sur chaque requête ; jeton invalide, expiré ou révoqué : `401`.
- En-tête `Origin` vérifié (protection contre le DNS rebinding).
- Limitation de débit par jeton (`MCP_RATE_LIMIT_PER_MINUTE`) et corps de requête limité à 256 Ko.
- Sans session : aucune donnée d’un utilisateur ne reste en mémoire pour le suivant.

## Pour l’administrateur

- Désactiver complètement MCP : ne pas démarrer le profil `mcp`.
- Lecture seule : `MCP_ALLOW_WRITE=false`.
- Servir `/mcp` uniquement en HTTPS.
