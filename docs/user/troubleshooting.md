# Dépannage (utilisateurs)

| Symptôme                                   | Cause probable et solution                                                                                                     |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| « Session absente ou expirée »             | Reconnectez-vous ; les sessions expirent après 30 jours sans activité.                                                         |
| Je ne reçois pas l’e-mail de vérification  | Vérifiez les indésirables ; sinon l’administrateur doit configurer `SMTP_URL`.                                                 |
| Le lien d’invitation est « plus valide »   | Il a expiré, a été révoqué, déjà utilisé, ou vous êtes connecté avec un autre compte que l’adresse invitée.                    |
| Un workspace ou un projet a disparu        | Vous avez été retiré du workspace, ou il a été supprimé ; demandez à un administrateur.                                        |
| « Vous n’avez pas les droits »             | Votre rôle ne permet pas l’action ([rôles](./members-and-roles.md)).                                                           |
| Les messages n’arrivent plus en temps réel | La connexion temps réel s’est interrompue : rechargez la page ; un proxy qui met les réponses en tampon peut en être la cause. |
