import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/client';

export { Prisma, PrismaClient } from './generated/client';
export type { ApiToken, Channel, Project, Task, Team, User, Workspace } from './generated/client';

export const createPrismaClient = (databaseUrl: string) =>
  new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
