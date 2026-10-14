import { Inject, Injectable, type OnModuleDestroy } from '@nestjs/common';
import { Database } from '@opentask/database/database';
import { ENV, type Env } from '../../shared/config/env';

export type { Db } from '@opentask/database/database';

@Injectable()
export class PrismaService extends Database implements OnModuleDestroy {
  constructor(@Inject(ENV) env: Env) {
    super(env.DATABASE_URL);
  }

  async onModuleDestroy() {
    await this.disconnect();
  }
}
