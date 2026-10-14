import { Inject, Injectable } from '@nestjs/common';
import { RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import { WorkspaceNameMismatchError } from '../errors/workspace.errors';
import { assertCan, assertIsMember } from '../helpers/access.helper';
import { WorkspaceRepository } from '../repository/workspace.repository';

@Injectable()
export class DeleteWorkspaceUseCase {
  constructor(
    @Inject(WorkspaceRepository) private readonly workspaces: WorkspaceRepository,
    @Inject(RealtimeService) private readonly realtime: RealtimeService,
  ) {}

  async execute(actorId: string, workspaceId: string, confirmName: string): Promise<void> {
    const actor = assertIsMember(await this.workspaces.findForMember(workspaceId, actorId));
    assertCan(actor.role, 'workspace.delete');
    if (confirmName !== actor.workspace.name) throw new WorkspaceNameMismatchError();
    await this.workspaces.delete(workspaceId);
    this.realtime.control(workspaceId, { type: 'workspace.deleted' });
  }
}
