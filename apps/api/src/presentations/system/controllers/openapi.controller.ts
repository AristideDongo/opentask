import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { buildOpenApiDocument } from '@opentask/contracts/api/openapi';
import { Public } from '../../../shared/decorators/public.decorator';
import { APP_VERSION } from '../system.const';

@Controller('openapi.json')
@Public()
@SkipThrottle()
export class OpenApiController {
  private readonly document = buildOpenApiDocument(APP_VERSION);

  @Get()
  get() {
    return this.document;
  }
}
