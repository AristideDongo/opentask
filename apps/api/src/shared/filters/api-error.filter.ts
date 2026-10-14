import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException } from '@nestjs/common';
import type { ApiError, ErrorCode } from '@opentask/contracts/errors/api-error';
import type { Request, Response } from 'express';
import type { Logger } from '../../infrastructures/logger/logger.service';
import { ApiException } from '../errors/api.exception';
import { DomainError, type DomainErrorCode } from '../errors/domain.error';

const DOMAIN_STATUS: Record<DomainErrorCode, number> = {
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  CONFLICT: 409,
  VALIDATION_FAILED: 400,
  INVITATION_INVALID: 410,
};

const HTTP_CODES: Record<number, ErrorCode> = {
  400: 'VALIDATION_FAILED',
  401: 'UNAUTHENTICATED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  429: 'RATE_LIMITED',
};

const HTTP_MESSAGES: Partial<Record<ErrorCode, string>> = {
  UNAUTHENTICATED: 'Session absente ou expirée.',
  NOT_FOUND: 'Ressource introuvable.',
  RATE_LIMITED: 'Trop de requêtes. Réessayez dans quelques instants.',
};

const isBodyParserError = (e: unknown): boolean =>
  typeof e === 'object' &&
  e !== null &&
  'type' in e &&
  (e as { type: unknown }).type === 'entity.parse.failed';

@Catch()
export class ApiErrorFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const { status, body } = this.toResponse(exception);
    body.error.requestId = String(req.id ?? '');
    if (status >= 500)
      this.logger.error({ err: exception, requestId: req.id, path: req.path }, 'Erreur inattendue');
    res.status(status).json(body);
  }

  private toResponse(exception: unknown): { status: number; body: ApiError } {
    const make = (
      status: number,
      code: ErrorCode,
      message: string,
      details?: ApiError['error']['details'],
    ) => ({
      status,
      body: { error: { code, message, ...(details ? { details } : {}) } },
    });

    if (exception instanceof ApiException) {
      return make(exception.status, exception.code, exception.message, exception.details);
    }
    if (exception instanceof DomainError) {
      return make(DOMAIN_STATUS[exception.code], exception.code, exception.message);
    }
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const code = HTTP_CODES[status];
      if (code) return make(status, code, HTTP_MESSAGES[code] ?? exception.message);
      if (status === 413) return make(status, 'VALIDATION_FAILED', 'Requête trop volumineuse.');
    }
    if (isBodyParserError(exception))
      return make(400, 'VALIDATION_FAILED', 'Corps de requête JSON invalide.');
    return make(500, 'INTERNAL_ERROR', 'Une erreur interne est survenue.');
  }
}
