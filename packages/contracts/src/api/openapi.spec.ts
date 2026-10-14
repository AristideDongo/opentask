import { describe, expect, it } from 'vitest';
import { buildOpenApiDocument } from './openapi';
import { routes } from './routes';

describe('OpenAPI', () => {
  const doc = buildOpenApiDocument('test');

  it('documente chaque route du registre une seule fois', () => {
    const operations = Object.values(doc.paths).flatMap((p) => Object.keys(p));
    expect(operations).toHaveLength(routes.length);
    const ids = routes.map((r) => r.operationId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('convertit les paramètres de chemin', () => {
    expect(doc.paths['/api/v1/workspaces/{workspaceId}/members/{userId}']).toBeDefined();
  });
});
