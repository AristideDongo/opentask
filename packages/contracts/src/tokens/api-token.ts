import { z } from 'zod';
import { IdSchema, IsoDateTimeSchema } from '../common/primitives';
import { ShortNameSchema } from '../common/text';

export const API_TOKEN_PREFIX = 'otk_';

export const API_TOKEN_SCOPES = ['read', 'write'] as const;
export const ApiTokenScopeSchema = z.enum(API_TOKEN_SCOPES);
export type ApiTokenScope = z.infer<typeof ApiTokenScopeSchema>;

export const API_TOKEN_LIFETIMES = [30, 90, 365] as const;

export const ApiTokenSchema = z.object({
  id: IdSchema,
  name: z.string(),
  hint: z.string(),
  scopes: z.array(ApiTokenScopeSchema),
  lastUsedAt: IsoDateTimeSchema.nullable(),
  expiresAt: IsoDateTimeSchema,
  createdAt: IsoDateTimeSchema,
});
export type ApiToken = z.infer<typeof ApiTokenSchema>;

export const ApiTokenListSchema = z.object({ items: z.array(ApiTokenSchema) });
export type ApiTokenList = z.infer<typeof ApiTokenListSchema>;

export const CreateApiTokenInputSchema = z.object({
  name: ShortNameSchema,
  scopes: z
    .array(ApiTokenScopeSchema)
    .min(1, { error: 'Choisissez au moins une permission.' })
    .transform((scopes) => [...new Set(scopes)]),
  expiresInDays: z.union([z.literal(30), z.literal(90), z.literal(365)]).default(90),
});
export type CreateApiTokenInput = z.input<typeof CreateApiTokenInputSchema>;
export type CreateApiTokenData = z.output<typeof CreateApiTokenInputSchema>;

export const CreatedApiTokenSchema = ApiTokenSchema.extend({ token: z.string() });
export type CreatedApiToken = z.infer<typeof CreatedApiTokenSchema>;

export const scopeForMethod = (method: string): ApiTokenScope =>
  ['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase()) ? 'read' : 'write';
