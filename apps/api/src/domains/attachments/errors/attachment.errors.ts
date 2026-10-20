import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../../../shared/errors/domain.error';

export class AttachmentNotFoundError extends NotFoundError {
  constructor() {
    super('Fichier introuvable.');
  }
}

export class AttachmentDeleteForbiddenError extends ForbiddenError {
  constructor() {
    super('Seule la personne qui a envoyé ce fichier, ou un administrateur, peut le supprimer.');
  }
}

export class AttachmentsUnavailableError extends ValidationError {
  constructor() {
    super('Certains fichiers sont introuvables ou déjà utilisés : envoyez-les à nouveau.');
  }
}

export class EmptyFileError extends ValidationError {
  constructor() {
    super('Le fichier est vide ou absent (champ « file »).');
  }
}
