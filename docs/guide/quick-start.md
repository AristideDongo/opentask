# Démarrage rapide

## Essayer en local (développement)

Prérequis : Node.js 24, pnpm 12 (`corepack enable` ou `npm i -g pnpm@12`), Docker.

```sh
git clone https://github.com/AristideDongo/opentask.git
cd opentask
cp .env.example .env            # remplacez AUTH_SECRET : openssl rand -base64 48
pnpm install
pnpm db:up                      # PostgreSQL + Mailpit (e-mails : http://localhost:8025)
pnpm db:migrate
pnpm dev                        # API : http://localhost:4000 · interface : http://localhost:5173
```

Ouvrez `http://localhost:5173`, créez un compte puis un workspace.

## Installer pour une équipe

Suivez [le guide d’installation](../deployment/installation.md) : une installation Docker Compose avec HTTPS automatique (Caddy) ou derrière votre propre proxy.
