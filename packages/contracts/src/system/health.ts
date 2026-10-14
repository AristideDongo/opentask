import { z } from 'zod';

export const HealthSchema = z.object({ status: z.literal('ok') });

export const ReadinessSchema = z.object({
  status: z.enum(['ok', 'degraded']),
  checks: z.record(z.string(), z.enum(['ok', 'fail'])),
});
export type Readiness = z.infer<typeof ReadinessSchema>;
