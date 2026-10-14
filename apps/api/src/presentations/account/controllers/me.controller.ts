import { Body, Controller, Get, Inject, Patch } from '@nestjs/common';
import {
  type Me,
  type UpdateProfileInput,
  UpdateProfileInputSchema,
} from '@opentask/contracts/me/profile';
import { GetProfileUseCase } from '../../../domains/users/use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from '../../../domains/users/use-cases/update-profile.use-case';
import { UserId } from '../../../shared/decorators/user-id.decorator';
import { ZodPipe } from '../../../shared/pipes/zod.pipe';

@Controller('me')
export class MeController {
  constructor(
    @Inject(GetProfileUseCase) private readonly getProfile: GetProfileUseCase,
    @Inject(UpdateProfileUseCase) private readonly updateProfile: UpdateProfileUseCase,
  ) {}

  @Get()
  get(@UserId() userId: string): Promise<Me> {
    return this.getProfile.execute(userId);
  }

  @Patch()
  update(
    @UserId() userId: string,
    @Body(new ZodPipe(UpdateProfileInputSchema)) input: UpdateProfileInput,
  ): Promise<Me> {
    return this.updateProfile.execute(userId, input);
  }
}
