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
  type CreateLabelInput,
  CreateLabelInputSchema,
  type Label,
  type LabelList,
  type UpdateLabelInput,
  UpdateLabelInputSchema,
} from '@opentask/contracts/projects/label';
import { CreateLabelUseCase } from '../../../domains/projects/use-cases/create-label.use-case';
import { DeleteLabelUseCase } from '../../../domains/projects/use-cases/delete-label.use-case';
import { ListLabelsUseCase } from '../../../domains/projects/use-cases/list-labels.use-case';
import { UpdateLabelUseCase } from '../../../domains/projects/use-cases/update-label.use-case';
import { UserId } from '../../../shared/decorators/user-id.decorator';
import { ZodPipe } from '../../../shared/pipes/zod.pipe';

@Controller('workspaces/:workspaceId/projects/:projectId/labels')
export class LabelsController {
  constructor(
    @Inject(ListLabelsUseCase) private readonly listLabels: ListLabelsUseCase,
    @Inject(CreateLabelUseCase) private readonly createLabel: CreateLabelUseCase,
    @Inject(UpdateLabelUseCase) private readonly updateLabel: UpdateLabelUseCase,
    @Inject(DeleteLabelUseCase) private readonly deleteLabel: DeleteLabelUseCase,
  ) {}

  @Get()
  async list(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
  ): Promise<LabelList> {
    return { items: await this.listLabels.execute(userId, workspaceId, projectId) };
  }

  @Post()
  create(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body(new ZodPipe(CreateLabelInputSchema)) input: CreateLabelInput,
  ): Promise<Label> {
    return this.createLabel.execute(userId, workspaceId, projectId, input);
  }

  @Patch(':labelId')
  update(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('labelId') labelId: string,
    @Body(new ZodPipe(UpdateLabelInputSchema)) input: UpdateLabelInput,
  ): Promise<Label> {
    return this.updateLabel.execute(userId, workspaceId, projectId, labelId, input);
  }

  @Delete(':labelId')
  @HttpCode(204)
  async remove(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('labelId') labelId: string,
  ): Promise<void> {
    await this.deleteLabel.execute(userId, workspaceId, projectId, labelId);
  }
}
