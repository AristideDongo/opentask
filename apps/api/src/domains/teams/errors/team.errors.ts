import { ConflictError, NotFoundError } from '../../../shared/errors/domain.error';

export class TeamNotFoundError extends NotFoundError {
  constructor() {
    super('Équipe introuvable.');
  }
}

export class TeamNameTakenError extends ConflictError {
  constructor() {
    super('Une équipe porte déjà ce nom dans le workspace.');
  }
}
