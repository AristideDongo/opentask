import type { ErrorCode, FieldError } from '@opentask/contracts/errors/api-error';

export class ApiException extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
    readonly details?: FieldError[],
  ) {
    super(message);
  }
}
