import { NotFoundError } from '../../../shared/errors/domain.error';

export class UserNotFoundError extends NotFoundError {
  constructor() {
    super('Utilisateur introuvable.');
  }
}
