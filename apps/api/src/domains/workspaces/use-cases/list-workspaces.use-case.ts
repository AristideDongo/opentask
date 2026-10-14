import { Inject, Injectable } from '@nestjs/common';
import type { Workspace } from '@opentask/contracts/workspaces/workspace';
import { toMemberWorkspaceDto } from '../mappers/workspace.mapper';
import { WorkspaceRepository } from '../repository/workspace.repository';

@Injectable()
export class ListWorkspacesUseCase {
  constructor(@Inject(WorkspaceRepository) private readonly workspaces: WorkspaceRepository) {}

  async execute(actorId: string): Promise<Workspace[]> {
    return (await this.workspaces.listForUser(actorId)).map(toMemberWorkspaceDto);
  }
}
