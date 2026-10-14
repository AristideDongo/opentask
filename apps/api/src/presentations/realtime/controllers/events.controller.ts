import { Controller, Inject, type MessageEvent, Param, Res, Sse } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Response } from 'express';
import type { Observable } from 'rxjs';
import { GetWorkspaceUseCase } from '../../../domains/workspaces/use-cases/get-workspace.use-case';
import { RealtimeService } from '../../../infrastructures/realtime/realtime.service';
import { UserId } from '../../../shared/decorators/user-id.decorator';

@Controller('workspaces/:workspaceId/events')
@SkipThrottle()
export class EventsController {
  constructor(
    @Inject(GetWorkspaceUseCase) private readonly getWorkspace: GetWorkspaceUseCase,
    @Inject(RealtimeService) private readonly realtime: RealtimeService,
  ) {}

  @Sse()
  async stream(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Observable<MessageEvent>> {
    const workspace = await this.getWorkspace.execute(userId, workspaceId);
    res.setHeader('X-Accel-Buffering', 'no');
    return this.realtime.connect(workspaceId, userId, workspace.myRole);
  }
}
