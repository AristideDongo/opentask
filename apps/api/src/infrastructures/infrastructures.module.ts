import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { MailService } from './mail/mail.service';
import { PrismaService } from './prisma/prisma.service';
import { RealtimeService } from './realtime/realtime.service';

@Global()
@Module({
  providers: [PrismaService, MailService, AuthService, RealtimeService],
  exports: [PrismaService, MailService, AuthService, RealtimeService],
})
export class InfrastructuresModule {}
