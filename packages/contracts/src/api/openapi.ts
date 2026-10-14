import { z } from 'zod';
import { ApiErrorSchema } from '../errors/api-error';
import { API_PREFIX, type RouteContract, routes } from './routes';

const toSchema = (schema: z.ZodType, io: 'input' | 'output') =>
  z.toJSONSchema(schema, { io, target: 'openapi-3.0', unrepresentable: 'any' });

const toOpenApiPath = (path: string) => path.replace(/:([A-Za-z]+)/g, '{$1}');

const errorResponse = (description: string) => ({
  description,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
});

function operation(route: RouteContract) {
  const params = [...route.path.matchAll(/:([A-Za-z]+)/g)].map((m) => ({
    name: m[1],
    in: 'path',
    required: true,
    schema: { type: 'string' },
  }));
  const query = route.query
    ? Object.entries(
        (toSchema(route.query, 'input') as { properties?: Record<string, unknown> }).properties ??
          {},
      ).map(([name, schema]) => ({ name, in: 'query', required: false, schema }))
    : [];
  const status = String(route.status ?? 200);

  return {
    operationId: route.operationId,
    summary: route.summary,
    tags: [route.tag],
    ...(route.auth === 'session' ? { security: [{ session: [] }] } : { security: [] }),
    parameters: [...params, ...query],
    ...(route.body
      ? {
          requestBody: {
            required: true,
            content: { 'application/json': { schema: toSchema(route.body, 'input') } },
          },
        }
      : {}),
    responses: {
      [status]: route.response
        ? {
            description: 'Succès',
            content: { 'application/json': { schema: toSchema(route.response, 'output') } },
          }
        : { description: 'Succès' },
      '400': errorResponse('Requête invalide'),
      ...(route.auth === 'session' ? { '401': errorResponse('Session absente ou expirée') } : {}),
      '403': errorResponse('Action interdite pour ce rôle'),
      '404': errorResponse('Ressource introuvable ou inaccessible'),
      '429': errorResponse('Trop de requêtes'),
    },
  };
}

export function buildOpenApiDocument(version: string) {
  const paths: Record<string, Record<string, unknown>> = {};
  for (const route of routes as readonly RouteContract[]) {
    const key = `${API_PREFIX}${toOpenApiPath(route.path)}`;
    paths[key] = { ...paths[key], [route.method]: operation(route) };
  }

  return {
    openapi: '3.0.3',
    info: {
      title: 'OpenTask API',
      version,
      description:
        'API REST d’OpenTask. Authentification par cookie de session (better-auth). Les erreurs suivent un format stable `{ error: { code, message, details?, requestId? } }`.',
      license: { name: 'AGPL-3.0-only', url: 'https://www.gnu.org/licenses/agpl-3.0.html' },
    },
    servers: [{ url: '/' }],
    components: {
      securitySchemes: {
        session: { type: 'apiKey', in: 'cookie', name: 'opentask.session_token' },
      },
      schemas: { ApiError: toSchema(ApiErrorSchema, 'output') },
    },
    paths,
  };
}
