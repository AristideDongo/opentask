import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  CreateProjectInputSchema,
  type Project,
  type ProjectList,
  type UpdateProjectInput,
  UpdateProjectInputSchema,
} from '@opentask/contracts/projects/project';
import type { z } from 'zod';
import { CreateProjectUseCase } from '../../../domains/projects/use-cases/create-project.use-case';
import { DeleteProjectUseCase } from '../../../domains/projects/use-cases/delete-project.use-case';
import { GetProjectUseCase } from '../../../domains/projects/use-cases/get-project.use-case';
import { ListProjectsUseCase } from '../../../domains/projects/use-cases/list-projects.use-case';
import { UpdateProjectUseCase } from '../../../domains/projects/use-cases/update-project.use-case';
import { UserId } from '../../../shared/decorators/user-id.decorator';
import { ZodPipe } from '../../../shared/pipes/zod.pipe';

@Controller('workspaces/:workspaceId/projects')
export class ProjectsController {
  constructor(
    @Inject(ListProjectsUseCase) private readonly listProjects: ListProjectsUseCase,
    @Inject(CreateProjectUseCase) private readonly createProject: CreateProjectUseCase,
    @Inject(GetProjectUseCase) private readonly getProject: GetProjectUseCase,
    @Inject(UpdateProjectUseCase) private readonly updateProject: UpdateProjectUseCase,
    @Inject(DeleteProjectUseCase) private readonly deleteProject: DeleteProjectUseCase,
  ) {}

  @Get()
  async list(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
  ): Promise<ProjectList> {
    return { items: await this.listProjects.execute(userId, workspaceId) };
  }

  @Post()
  create(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Body(new ZodPipe(CreateProjectInputSchema)) input: z.output<typeof CreateProjectInputSchema>,
  ): Promise<Project> {
    return this.createProject.execute(userId, workspaceId, input);
  }

  @Get(':projectId')
  get(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
  ): Promise<Project> {
    return this.getProject.execute(userId, workspaceId, projectId);
  }

  @Patch(':projectId')
  update(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body(new ZodPipe(UpdateProjectInputSchema)) input: UpdateProjectInput,
  ): Promise<Project> {
    return this.updateProject.execute(userId, workspaceId, projectId, input);
  }

  @Delete(':projectId')
  @HttpCode(204)
  async remove(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
  ): Promise<void> {
    await this.deleteProject.execute(userId, workspaceId, projectId);
  }
}
