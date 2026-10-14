import { ConflictError, NotFoundError, ValidationError } from '../../../shared/errors/domain.error';
import { CATEGORY_NAMES, MAX_COLUMNS_PER_PROJECT, MAX_LABELS_PER_PROJECT } from '../projects.const';
import type { TaskStatus } from '@opentask/contracts/tasks/status';

export class ProjectNotFoundError extends NotFoundError {
  constructor() {
    super('Projet introuvable.');
  }
}

export class UnknownTeamError extends ValidationError {
  constructor() {
    super('Équipe inconnue dans ce workspace.');
  }
}

export class ColumnNotFoundError extends NotFoundError {
  constructor() {
    super('Colonne introuvable.');
  }
}

export class UnknownColumnError extends ValidationError {
  constructor() {
    super('Colonne inconnue dans ce projet.');
  }
}

export class MissingColumnCategoryError extends ValidationError {
  constructor(category: TaskStatus) {
    super(`Ce projet n’a aucune colonne de type « ${CATEGORY_NAMES[category]} ».`);
  }
}

export class NoColumnError extends ValidationError {
  constructor() {
    super('Ce projet n’a aucune colonne.');
  }
}

export class InvalidColumnReferenceError extends ValidationError {
  constructor() {
    super('Colonne de référence invalide.');
  }
}

export class InvalidColumnDestinationError extends ValidationError {
  constructor() {
    super('Colonne de destination invalide.');
  }
}

export class TooManyColumnsError extends ValidationError {
  constructor() {
    super(`Un projet est limité à ${MAX_COLUMNS_PER_PROJECT} colonnes.`);
  }
}

export class LastColumnError extends ConflictError {
  constructor() {
    super('Un projet doit garder au moins une colonne.');
  }
}

export class ColumnNotEmptyError extends ConflictError {
  constructor() {
    super('Cette colonne contient des tâches : choisissez la colonne qui les recevra.');
  }
}

export class LabelNotFoundError extends NotFoundError {
  constructor() {
    super('Tag introuvable.');
  }
}

export class LabelNameTakenError extends ConflictError {
  constructor() {
    super('Un tag porte déjà ce nom dans ce projet.');
  }
}

export class TooManyLabelsError extends ValidationError {
  constructor() {
    super(`Un projet est limité à ${MAX_LABELS_PER_PROJECT} tags.`);
  }
}
