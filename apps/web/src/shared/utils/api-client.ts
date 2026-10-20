import type { ErrorCode, FieldError } from '@opentask/contracts/errors/api-error';

export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode | string,
    message: string,
    readonly details: FieldError[] = [],
  ) {
    super(message);
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export async function apiClient<T = unknown>(
  path: string,
  options: { method?: Method; body?: unknown } = {},
): Promise<T> {
  const method = options.method ?? 'GET';
  let response: Response;
  try {
    response = await fetch(`/api/v1${path}`, {
      method,
      credentials: 'same-origin',
      headers: options.body !== undefined ? { 'content-type': 'application/json' } : undefined,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiRequestError(0, 'NETWORK_ERROR', 'Network error');
  }

  if (response.status === 204) return undefined as T;
  const payload: unknown = await response.json().catch(() => null);
  if (response.ok) return payload as T;

  if (payload && typeof payload === 'object' && 'error' in payload) {
    const { code, message, details } = (
      payload as { error: { code: string; message: string; details?: FieldError[] } }
    ).error;
    throw new ApiRequestError(response.status, code, message, details ?? []);
  }
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const { code, message } = payload as { code?: string; message: string };
    throw new ApiRequestError(response.status, code ?? `HTTP_${response.status}`, message);
  }
  throw new ApiRequestError(response.status, `HTTP_${response.status}`, response.statusText);
}

export async function apiUpload<T = unknown>(path: string, file: File): Promise<T> {
  const form = new FormData();
  form.append('file', file);
  let response: Response;
  try {
    response = await fetch(`/api/v1${path}`, {
      method: 'POST',
      credentials: 'same-origin',
      body: form,
    });
  } catch {
    throw new ApiRequestError(0, 'NETWORK_ERROR', 'Network error');
  }
  const payload: unknown = await response.json().catch(() => null);
  if (response.ok) return payload as T;
  if (payload && typeof payload === 'object' && 'error' in payload) {
    const { code, message, details } = (
      payload as { error: { code: string; message: string; details?: FieldError[] } }
    ).error;
    throw new ApiRequestError(response.status, code, message, details ?? []);
  }
  throw new ApiRequestError(response.status, `HTTP_${response.status}`, response.statusText);
}

export const isApiError = (error: unknown, status: number): boolean =>
  error instanceof ApiRequestError && error.status === status;

export async function nullOn<T>(status: number, request: Promise<T>): Promise<T | null> {
  try {
    return await request;
  } catch (error) {
    if (isApiError(error, status)) return null;
    throw error;
  }
}
