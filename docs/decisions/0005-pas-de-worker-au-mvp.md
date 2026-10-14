# 0005 — Pas de Redis ni de worker tant que le besoin n’est pas avéré

**Statut : acceptée** — à réévaluer avec les notifications, les rappels d’échéance et les webhooks.

## Contexte

La spécification (§ 12) demande de ne pas introduire Redis et un worker séparé avant un besoin concret. Les seuls traitements asynchrones actuels sont les e-mails (invitation, vérification, réinitialisation).

## Décision

- Les e-mails sont envoyés **en arrière-plan dans le processus de l’API**, après validation de la transaction, avec 3 nouvelles tentatives espacées (1 s, 5 s, 30 s). Un échec d’envoi n’annule jamais l’opération métier.
- Le port `Mailer` de la couche application expose `enqueue…` : le remplacement par une vraie file (BullMQ, ou une table de travaux PostgreSQL) ne touchera pas les cas d’usage.

## Conséquences

- Un redémarrage de l’API pendant une tentative perd l’e-mail. Le lien d’invitation reste affiché à l’administrateur pour être transmis autrement.
- Le futur `apps/worker` sera ajouté avec la première fonctionnalité qui l’exige (rappels d’échéance, webhooks signés).
