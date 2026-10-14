import { NotFoundError, ValidationError } from '../../../shared/errors/domain.error';

export class TaskNotFoundError extends NotFoundError {
  constructor() {
    super('Tâche introuvable.');
  }
}

export class ParentTaskNotFoundError extends NotFoundError {
  constructor() {
    super('Tâche parente introuvable.');
  }
}

export class InvalidParentError extends ValidationError {
  constructor(message: string) {
    super(message);
  }
}

export class ForeignLabelError extends ValidationError {
  constructor() {
    super('Un des tags n’appartient pas à ce projet.');
  }
}

export class InvalidTaskPositionError extends ValidationError {
  constructor() {
    super('Position cible invalide.');
  }
}
