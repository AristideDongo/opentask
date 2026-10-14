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
  type CreateWorkspaceInput,
  CreateWorkspaceInputSchema,
  type DeleteWorkspaceInput,
  DeleteWorkspaceInputSchema,
  type TransferOwnershipInput,
  TransferOwnershipInputSchema,
  type UpdateWorkspaceInput,
  UpdateWorkspaceInputSchema,
  type Workspace,
  type WorkspaceList,
} from '@opentask/contracts/workspaces/workspace';
import { CreateWorkspaceUseCase } from '../../../domains/workspaces/use-cases/create-workspace.use-case';
import { DeleteWorkspaceUseCase } from '../../../domains/workspaces/use-cases/delete-workspace.use-case';
import { GetWorkspaceUseCase } from '../../../domains/workspaces/use-cases/get-workspace.use-case';
import { ListWorkspacesUseCase } from '../../../domains/workspaces/use-cases/list-workspaces.use-case';
import { TransferOwnershipUseCase } from '../../../domains/workspaces/use-cases/transfer-ownership.use-case';
import { UpdateWorkspaceUseCase } from '../../../domains/workspaces/use-cases/update-workspace.use-case';
import { UserId } from '../../../shared/decorators/user-id.decorator';
import { ZodPipe } from '../../../shared/pipes/zod.pipe';

@Controller('workspaces')
export class WorkspacesController {
  constructor(
    @Inject(ListWorkspacesUseCase) private readonly listWorkspaces: ListWorkspacesUseCase,
    @Inject(CreateWorkspaceUseCase) private readonly createWorkspace: CreateWorkspaceUseCase,
    @Inject(GetWorkspaceUseCase) private readonly getWorkspace: GetWorkspaceUseCase,
    @Inject(UpdateWorkspaceUseCase) private readonly updateWorkspace: UpdateWorkspaceUseCase,
    @Inject(DeleteWorkspaceUseCase) private readonly deleteWorkspace: DeleteWorkspaceUseCase,
    @Inject(TransferOwnershipUseCase) private readonly transferOwnership: TransferOwnershipUseCase,
  ) {}

  @Get()
  async list(@UserId() userId: string): Promise<WorkspaceList> {
    return { items: await this.listWorkspaces.execute(userId) };
  }

  @Post()
  create(
    @UserId() userId: string,
    @Body(new ZodPipe(CreateWorkspaceInputSchema)) input: CreateWorkspaceInput,
  ): Promise<Workspace> {
    return this.createWorkspace.execute(userId, input);
  }

  @Get(':workspaceId')
  get(@UserId() userId: string, @Param('workspaceId') workspaceId: string): Promise<Workspace> {
    return this.getWorkspace.execute(userId, workspaceId);
  }

  @Patch(':workspaceId')
  update(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Body(new ZodPipe(UpdateWorkspaceInputSchema)) input: UpdateWorkspaceInput,
  ): Promise<Workspace> {
    return this.updateWorkspace.execute(userId, workspaceId, input);
  }

  @Delete(':workspaceId')
  @HttpCode(204)
  async remove(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Body(new ZodPipe(DeleteWorkspaceInputSchema)) input: DeleteWorkspaceInput,
  ): Promise<void> {
    await this.deleteWorkspace.execute(userId, workspaceId, input.confirmName);
  }

  @Post(':workspaceId/transfer-ownership')
  @HttpCode(200)
  transfer(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Body(new ZodPipe(TransferOwnershipInputSchema)) input: TransferOwnershipInput,
  ): Promise<Workspace> {
    return this.transferOwnership.execute(userId, workspaceId, input.userId);
  }
}
