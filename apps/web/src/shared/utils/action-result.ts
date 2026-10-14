import { ApiRequestError } from './api-client';

export type ActionResult<T = undefined> =
  { ok: true; data: T } | { ok: false; error: ApiRequestError };

export async function toActionResult<T>(request: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await request() };
  } catch (error) {
    if (error instanceof ApiRequestError) return { ok: false, error };
    throw error;
  }
}

export const invalidInput = (): ActionResult<never> => ({
  ok: false,
  error: new ApiRequestError(400, 'VALIDATION_FAILED', 'Certaines données sont invalides.'),
});
