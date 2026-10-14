import { Inject, Injectable } from '@nestjs/common';
import type { Me } from '@opentask/contracts/me/profile';
import { UserNotFoundError } from '../errors/user.errors';
import { toMeDto } from '../mappers/user.mapper';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class GetProfileUseCase {
  constructor(@Inject(UserRepository) private readonly users: UserRepository) {}

  async execute(userId: string): Promise<Me> {
    const user = await this.users.findById(userId);
    if (!user) throw new UserNotFoundError();
    return toMeDto(user);
  }
}
