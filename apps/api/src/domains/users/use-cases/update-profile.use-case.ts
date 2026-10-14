import { Inject, Injectable } from '@nestjs/common';
import type { Me, UpdateProfileInput } from '@opentask/contracts/me/profile';
import { toMeDto } from '../mappers/user.mapper';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class UpdateProfileUseCase {
  constructor(@Inject(UserRepository) private readonly users: UserRepository) {}

  async execute(userId: string, input: UpdateProfileInput): Promise<Me> {
    return toMeDto(await this.users.update(userId, input));
  }
}
