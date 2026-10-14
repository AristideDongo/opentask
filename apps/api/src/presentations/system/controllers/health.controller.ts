import { Controller, Get, Inject, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Readiness } from '@opentask/contracts/system/health';
import type { Response } from 'express';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';
import { Public } from '../../../shared/decorators/public.decorator';

@Controller('health')
@Public()
@SkipThrottle()
export class HealthController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  health() {
    return { status: 'ok' as const };
  }

  @Get('ready')
  async ready(@Res({ passthrough: true }) res: Response): Promise<Readiness> {
    if (await this.prisma.isReady()) return { status: 'ok', checks: { database: 'ok' } };
    res.status(503);
    return { status: 'degraded', checks: { database: 'fail' } };
  }
}
