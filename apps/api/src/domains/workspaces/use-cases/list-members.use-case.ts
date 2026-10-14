import { Inject, Injectable } from '@nestjs/common';
import type { Member } from '@opentask/contracts/members/member';
import { assertCan, assertIsMember } from '../helpers/access.helper';
import { toMemberDto } from '../mappers/member.mapper';
import { MembershipRepository } from '../repository/membership.repository';

@Injectable()
export class ListMembersUseCase {
  constructor(@Inject(MembershipRepository) private readonly memberships: MembershipRepository) {}

  async execute(actorId: string, workspaceId: string): Promise<Member[]> {
    const actor = assertIsMember(await this.memberships.find(workspaceId, actorId));
    assertCan(actor.role, 'member.list');
    return (await this.memberships.list(workspaceId)).map(toMemberDto);
  }
}
