import { ApiErrorSchema } from '@opentask/contracts/errors/api-error';
import { OpenTaskApiError } from './opentask-client.errors';

const REQUEST_TIMEOUT_MS = 15_000;

const MAX_RESPONSE_BYTES = 2_000_000;

type Method = 'GET' | 'POST' | 'PATCH';

export interface OpenTaskClient {
  get<T>(path: string, query?: Record<string, string | undefined>): Promise<T>;
  post<T>(path: string, body: unknown): Promise<T>;
  patch<T>(path: string, body: unknown): Promise<T>;
}

const queryString = (query: Record<string, string | undefined> = {}) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) if (value) params.set(key, value);
  const text = params.toString();
  return text ? `?${text}` : '';
};

async function readError(response: Response): Promise<OpenTaskApiError> {
  const parsed = ApiErrorSchema.safeParse(await response.json().catch(() => null));
  if (parsed.success)
    return new OpenTaskApiError(response.status, parsed.data.error.code, parsed.data.error.message);
  return new OpenTaskApiError(
    response.status,
    'INTERNAL_ERROR',
    `L’API OpenTask a répondu ${response.status}.`,
  );
}

export function createOpenTaskClient(
  baseUrl: string,
  token: string,
  fetcher: typeof fetch = fetch,
): OpenTaskClient {
  const request = async <T>(method: Method, path: string, body?: unknown): Promise<T> => {
    let response: Response;
    try {
      response = await fetcher(`${baseUrl}/api/v1${path}`, {
        method,
        headers: {
          authorization: `Bearer ${token}`,
          accept: 'application/json',
          ...(body === undefined ? {} : { 'content-type': 'application/json' }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch {
      throw new OpenTaskApiError(503, 'UNAVAILABLE', 'L’instance OpenTask est injoignable.');
    }
    if (!response.ok) throw await readError(response);
    if (response.status === 204) return undefined as T;
    const text = await response.text();
    if (text.length > MAX_RESPONSE_BYTES) {
      throw new OpenTaskApiError(502, 'RESPONSE_TOO_LARGE', 'Réponse de l’API trop volumineuse.');
    }
    return JSON.parse(text) as T;
  };

  return {
    get: (path, query) => request('GET', `${path}${queryString(query)}`),
    post: (path, body) => request('POST', path, body),
    patch: (path, body) => request('PATCH', path, body),
  };
}
