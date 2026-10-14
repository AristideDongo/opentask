export type DomainErrorCode =
  'NOT_FOUND' | 'FORBIDDEN' | 'CONFLICT' | 'VALIDATION_FAILED' | 'INVITATION_INVALID';

export abstract class DomainError extends Error {
  abstract readonly code: DomainErrorCode;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export abstract class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';
}

export abstract class ForbiddenError extends DomainError {
  readonly code = 'FORBIDDEN';
}

export abstract class ConflictError extends DomainError {
  readonly code = 'CONFLICT';
}

export abstract class ValidationError extends DomainError {
  readonly code = 'VALIDATION_FAILED';
}
