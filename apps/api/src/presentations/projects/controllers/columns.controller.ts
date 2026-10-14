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
  type Column,
  type ColumnList,
  CreateColumnInputSchema,
  DeleteColumnInputSchema,
  type UpdateColumnInput,
  UpdateColumnInputSchema,
} from '@opentask/contracts/projects/column';
import type { z } from 'zod';
import { CreateColumnUseCase } from '../../../domains/projects/use-cases/create-column.use-case';
import { DeleteColumnUseCase } from '../../../domains/projects/use-cases/delete-column.use-case';
import { ListColumnsUseCase } from '../../../domains/projects/use-cases/list-columns.use-case';
import { UpdateColumnUseCase } from '../../../domains/projects/use-cases/update-column.use-case';
import { UserId } from '../../../shared/decorators/user-id.decorator';
import { ZodPipe } from '../../../shared/pipes/zod.pipe';

@Controller('workspaces/:workspaceId/projects/:projectId/columns')
export class ColumnsController {
  constructor(
    @Inject(ListColumnsUseCase) private readonly listColumns: ListColumnsUseCase,
    @Inject(CreateColumnUseCase) private readonly createColumn: CreateColumnUseCase,
    @Inject(UpdateColumnUseCase) private readonly updateColumn: UpdateColumnUseCase,
    @Inject(DeleteColumnUseCase) private readonly deleteColumn: DeleteColumnUseCase,
  ) {}

  @Get()
  async list(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
  ): Promise<ColumnList> {
    return { items: await this.listColumns.execute(userId, workspaceId, projectId) };
  }

  @Post()
  create(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body(new ZodPipe(CreateColumnInputSchema)) input: z.output<typeof CreateColumnInputSchema>,
  ): Promise<Column> {
    return this.createColumn.execute(userId, workspaceId, projectId, input);
  }

  @Patch(':columnId')
  update(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('columnId') columnId: string,
    @Body(new ZodPipe(UpdateColumnInputSchema)) input: UpdateColumnInput,
  ): Promise<Column> {
    return this.updateColumn.execute(userId, workspaceId, projectId, columnId, input);
  }

  @Delete(':columnId')
  @HttpCode(204)
  async remove(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('columnId') columnId: string,
    @Body(new ZodPipe(DeleteColumnInputSchema)) input: z.output<typeof DeleteColumnInputSchema>,
  ): Promise<void> {
    await this.deleteColumn.execute(userId, workspaceId, projectId, columnId, input.moveTasksTo);
  }
}
