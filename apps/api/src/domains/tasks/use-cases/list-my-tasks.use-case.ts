import { Inject, Injectable } from '@nestjs/common';
import type { MyTask } from '@opentask/contracts/tasks/task';
import { assertIsMember } from '../../workspaces/helpers/access.helper';
import { MembershipRepository } from '../../workspaces/repository/membership.repository';
import { toMyTaskDto } from '../mappers/task.mapper';
import { TaskRepository } from '../repository/task.repository';

@Injectable()
export class ListMyTasksUseCase {
  constructor(
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(TaskRepository) private readonly tasks: TaskRepository,
  ) {}

  async execute(actorId: string, workspaceId: string): Promise<MyTask[]> {
    assertIsMember(await this.memberships.find(workspaceId, actorId));
    return (await this.tasks.listAssigned(workspaceId, actorId)).map(toMyTaskDto);
  }
}
