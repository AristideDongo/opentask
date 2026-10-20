import {
  type CallHandler,
  type ExecutionContext,
  Inject,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import multer, { MulterError } from 'multer';
import type { Observable } from 'rxjs';
import { ENV, type Env } from '../config/env';
import { ApiException } from '../errors/api.exception';

export const UPLOAD_FIELD = 'file';

const BYTES_PER_MB = 1024 * 1024;

@Injectable()
export class UploadInterceptor implements NestInterceptor {
  private readonly maxMb: number;
  private readonly handler;

  constructor(@Inject(ENV) env: Env) {
    this.maxMb = env.MAX_UPLOAD_MB;
    this.handler = multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: Math.round(env.MAX_UPLOAD_MB * BYTES_PER_MB), files: 1, fields: 5 },
    }).single(UPLOAD_FIELD);
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    await new Promise<void>((resolve, reject) => {
      this.handler(req, res, (error: unknown) =>
        error ? reject(this.translate(error)) : resolve(),
      );
    });
    return next.handle();
  }

  private translate(error: unknown) {
    if (error instanceof MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return new ApiException(
        413,
        'PAYLOAD_TOO_LARGE',
        `Fichier trop volumineux : ${this.maxMb} Mo maximum.`,
      );
    }
    if (error instanceof MulterError) {
      return new ApiException(
        400,
        'VALIDATION_FAILED',
        `Envoyez un seul fichier dans le champ « ${UPLOAD_FIELD} ».`,
      );
    }
    return new ApiException(
      400,
      'VALIDATION_FAILED',
      'Requête d’envoi de fichier invalide (multipart/form-data attendu).',
    );
  }
}
