import { Module } from '@nestjs/common';
import { HealthController } from './controllers/health.controller';
import { OpenApiController } from './controllers/openapi.controller';

@Module({ controllers: [HealthController, OpenApiController] })
export class SystemModule {}
