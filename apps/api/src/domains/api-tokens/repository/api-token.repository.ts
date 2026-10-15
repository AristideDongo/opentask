import { Inject, Injectable } from '@nestjs/common';
import type { ApiTokenScope } from '@opentask/contracts/tokens/api-token';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';

@Injectable()
export class ApiTokenRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  listForUser(userId: string) {
    return this.prisma.db.apiToken.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  countForUser(userId: string) {
    return this.prisma.db.apiToken.count({ where: { userId } });
  }

  create(data: {
    userId: string;
    name: string;
    tokenHash: string;
    hint: string;
    scopes: ApiTokenScope[];
    expiresAt: Date;
  }) {
    return this.prisma.db.apiToken.create({ data });
  }

  findByHash(tokenHash: string) {
    return this.prisma.db.apiToken.findUnique({ where: { tokenHash } });
  }

  async deleteForUser(userId: string, id: string) {
    const { count } = await this.prisma.db.apiToken.deleteMany({ where: { id, userId } });
    return count > 0;
  }

  touch(id: string, at: Date) {
    return this.prisma.db.apiToken.update({ where: { id }, data: { lastUsedAt: at } });
  }
}
