import { DomainError, NotFoundError } from '../../../shared/errors/domain.error';

export class InvitationInvalidError extends DomainError {
  readonly code = 'INVITATION_INVALID';

  constructor(message = 'Ce lien d’invitation n’est plus valide.') {
    super(message);
  }
}

export class InvitationRecipientMismatchError extends InvitationInvalidError {
  constructor() {
    super(
      'Cette invitation a été envoyée à une autre adresse e-mail. Connectez-vous avec le bon compte.',
    );
  }
}

export class InvitationNotFoundError extends NotFoundError {
  constructor() {
    super('Invitation introuvable.');
  }
}

export class InvitationNotPendingError extends DomainError {
  readonly code = 'CONFLICT';

  constructor() {
    super('Cette invitation n’est plus en attente.');
  }
}
