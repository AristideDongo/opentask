import { Inject, Injectable } from '@nestjs/common';
import type { AuditLogPage } from '@opentask/contracts/audit/audit-log';
import type { CursorQuery } from '@opentask/contracts/common/pagination';
import { assertCan, assertIsMember } from '../helpers/access.helper';
import { toAuditLogEntryDto } from '../mappers/audit-log.mapper';
import { AuditLogRepository } from '../repository/audit-log.repository';
import { MembershipRepository } from '../repository/membership.repository';

@Injectable()
export class ListAuditLogsUseCase {
  constructor(
    @Inject(MembershipRepository) private readonly memberships: MembershipRepository,
    @Inject(AuditLogRepository) private readonly audit: AuditLogRepository,
  ) {}

  async execute(actorId: string, workspaceId: string, query: CursorQuery): Promise<AuditLogPage> {
    const actor = assertIsMember(await this.memberships.find(workspaceId, actorId));
    assertCan(actor.role, 'audit.read');
    const page = await this.audit.list(workspaceId, query);
    return { items: page.items.map(toAuditLogEntryDto), nextCursor: page.nextCursor };
  }
}
