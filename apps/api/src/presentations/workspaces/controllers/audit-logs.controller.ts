import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import type { AuditLogPage } from '@opentask/contracts/audit/audit-log';
import { type CursorQuery, CursorQuerySchema } from '@opentask/contracts/common/pagination';
import { ListAuditLogsUseCase } from '../../../domains/workspaces/use-cases/list-audit-logs.use-case';
import { UserId } from '../../../shared/decorators/user-id.decorator';
import { ZodPipe } from '../../../shared/pipes/zod.pipe';

@Controller('workspaces/:workspaceId/audit-logs')
export class AuditLogsController {
  constructor(@Inject(ListAuditLogsUseCase) private readonly listAuditLogs: ListAuditLogsUseCase) {}

  @Get()
  list(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Query(new ZodPipe(CursorQuerySchema)) query: CursorQuery,
  ): Promise<AuditLogPage> {
    return this.listAuditLogs.execute(userId, workspaceId, query);
  }
}
