import { Inject, Injectable } from '@nestjs/common';
import type { Locale } from '@opentask/contracts/me/profile';
import { PrismaService } from '../../../infrastructures/prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.db.user.findUnique({ where: { id } });
  }

  update(id: string, data: { name?: string; locale?: Locale; timezone?: string }) {
    return this.prisma.db.user.update({ where: { id }, data });
  }
}
