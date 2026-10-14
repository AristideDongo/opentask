import { AsyncLocalStorage } from 'node:async_hooks';
import { createPrismaClient, type Prisma, type PrismaClient } from './client';

export type Db = Prisma.TransactionClient | PrismaClient;

export class Database {
  readonly client: PrismaClient;
  private readonly scope = new AsyncLocalStorage<Prisma.TransactionClient>();

  constructor(databaseUrl: string) {
    this.client = createPrismaClient(databaseUrl);
  }

  get db(): Db {
    return this.scope.getStore() ?? this.client;
  }

  transaction<T>(work: () => Promise<T>): Promise<T> {
    if (this.scope.getStore()) return work();
    return this.client.$transaction((tx) => this.scope.run(tx, work));
  }

  async isReady(): Promise<boolean> {
    try {
      await this.client.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  disconnect() {
    return this.client.$disconnect();
  }
}
