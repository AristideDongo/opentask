import type { DenialReason } from '@opentask/contracts/workspaces/permissions';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../../../shared/errors/domain.error';

export class WorkspaceNotFoundError extends NotFoundError {
  constructor() {
    super('Workspace introuvable.');
  }
}

export class MemberNotFoundError extends NotFoundError {
  constructor() {
    super('Membre introuvable.');
  }
}

const DENIAL_MESSAGES: Record<DenialReason, string> = {
  insufficient_role: 'Action non autorisée pour votre rôle.',
  owner_role_locked: 'Le rôle du propriétaire ne peut changer que par un transfert de propriété.',
  own_role: 'Vous ne pouvez pas modifier votre propre rôle.',
  owner_must_transfer:
    'Le propriétaire doit transférer la propriété avant de quitter le workspace.',
  already_owner: 'Vous êtes déjà propriétaire.',
  guest_cannot_own: 'Un invité doit d’abord devenir membre avant de recevoir la propriété.',
  admin_grant_reserved: 'Seul le propriétaire peut inviter ou nommer un administrateur.',
  not_task_author: 'Seuls l’auteur de la tâche et les administrateurs peuvent la supprimer.',
};

export class ForbiddenActionError extends ForbiddenError {
  constructor(reason: DenialReason | string = 'insufficient_role') {
    super(DENIAL_MESSAGES[reason as DenialReason] ?? reason);
  }
}

export class WorkspaceNameMismatchError extends ValidationError {
  constructor() {
    super('Le nom saisi ne correspond pas au nom du workspace.');
  }
}

export class NotWorkspaceMemberError extends ValidationError {
  constructor() {
    super('Cette personne n’est pas membre du workspace.');
  }
}

export class AlreadyMemberError extends ConflictError {
  constructor() {
    super('Cette personne est déjà membre du workspace.');
  }
}
