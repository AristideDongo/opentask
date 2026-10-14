import { Inject, Injectable } from '@nestjs/common';
import type { Transporter } from 'nodemailer';
import { ENV, type Env } from '../../shared/config/env';
import { LOGGER, type Logger } from '../logger/logger.service';
import { MAIL_RETRY_DELAYS_MS, createMailTransport } from './mail.config';
import {
  type EmailContent,
  invitationEmail,
  passwordResetEmail,
  verificationEmail,
} from './mail.templates';

@Injectable()
export class MailService {
  private readonly transport: Transporter | null;

  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(LOGGER) private readonly logger: Logger,
  ) {
    this.transport = createMailTransport(env);
  }

  enqueueInvitation(message: {
    to: string;
    workspaceName: string;
    inviterName: string;
    inviteUrl: string;
  }) {
    this.enqueue(message.to, invitationEmail(message), message.inviteUrl, 'invitation');
  }

  enqueueVerification(to: string, name: string, url: string, locale: string) {
    this.enqueue(to, verificationEmail({ name, url, locale }), url, 'email_verification');
  }

  enqueuePasswordReset(to: string, name: string, url: string, locale: string) {
    this.enqueue(to, passwordResetEmail({ name, url, locale }), url, 'password_reset');
  }

  private enqueue(to: string, content: EmailContent, link: string, kind: string) {
    if (!this.transport) {
      if (this.env.NODE_ENV === 'production')
        this.logger.warn({ kind }, 'SMTP_URL non configuré : e-mail non envoyé');
      else
        this.logger.info(
          { kind, to, link },
          'E-mail non envoyé (SMTP_URL absent), lien affiché pour le développement',
        );
      return;
    }
    void this.send(to, content, kind, 0);
  }

  private async send(
    to: string,
    content: EmailContent,
    kind: string,
    attempt: number,
  ): Promise<void> {
    try {
      await this.transport!.sendMail({ from: this.env.MAIL_FROM, to, ...content });
      this.logger.info({ kind, attempt }, 'E-mail envoyé');
    } catch (error) {
      const delay = MAIL_RETRY_DELAYS_MS[attempt];
      if (delay === undefined) {
        this.logger.error({ kind, err: error }, 'Échec définitif de l’envoi d’e-mail');
        return;
      }
      this.logger.warn(
        { kind, attempt, err: error },
        'Échec de l’envoi d’e-mail, nouvelle tentative',
      );
      setTimeout(() => void this.send(to, content, kind, attempt + 1), delay).unref();
    }
  }
}
