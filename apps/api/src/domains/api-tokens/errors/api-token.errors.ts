import type { ApiTokenScope } from '@opentask/contracts/tokens/api-token';
import { ConflictError, ForbiddenError, NotFoundError } from '../../../shared/errors/domain.error';

export class ApiTokenNotFoundError extends NotFoundError {
  constructor() {
    super('Jeton d’API introuvable.');
  }
}

export class ApiTokenLimitError extends ConflictError {
  constructor(max: number) {
    super(
      `Vous avez atteint la limite de ${max} jetons d’API. Révoquez-en un avant d’en créer un autre.`,
    );
  }
}

export class ApiTokenScopeError extends ForbiddenError {
  constructor(scope: ApiTokenScope) {
    super(`Ce jeton d’API n’a pas la permission « ${scope} ».`);
  }
}
