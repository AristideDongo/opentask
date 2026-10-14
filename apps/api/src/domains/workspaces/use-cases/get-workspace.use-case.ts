import { Inject, Injectable } from '@nestjs/common';
import type { Workspace } from '@opentask/contracts/workspaces/workspace';
import { assertIsMember } from '../helpers/access.helper';
import { toMemberWorkspaceDto } from '../mappers/workspace.mapper';
import { WorkspaceRepository } from '../repository/workspace.repository';

@Injectable()
export class GetWorkspaceUseCase {
  constructor(@Inject(WorkspaceRepository) private readonly workspaces: WorkspaceRepository) {}

  async execute(actorId: string, workspaceId: string): Promise<Workspace> {
    return toMemberWorkspaceDto(
      assertIsMember(await this.workspaces.findForMember(workspaceId, actorId)),
    );
  }
}
