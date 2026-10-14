import { ConflictError, ForbiddenError, NotFoundError } from '../../../shared/errors/domain.error';

export class ChannelNotFoundError extends NotFoundError {
  constructor() {
    super('Canal introuvable.');
  }
}

export class ChannelNameTakenError extends ConflictError {
  constructor() {
    super('Un canal porte déjà ce nom dans le workspace.');
  }
}

export class ChannelManagementForbiddenError extends ForbiddenError {
  constructor() {
    super('Seuls le créateur du canal et les administrateurs peuvent le modifier.');
  }
}

export class MessageNotFoundError extends NotFoundError {
  constructor() {
    super('Message introuvable.');
  }
}

export class MessageDeletedError extends ConflictError {
  constructor() {
    super('Ce message a été supprimé.');
  }
}

export class MessageEditForbiddenError extends ForbiddenError {
  constructor() {
    super('Vous ne pouvez modifier que vos propres messages.');
  }
}

export class MessageDeleteForbiddenError extends ForbiddenError {
  constructor() {
    super('Vous ne pouvez supprimer que vos propres messages.');
  }
}
