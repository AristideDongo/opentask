import type { PipeTransform } from '@nestjs/common';
import type { z } from 'zod';
import { ApiException } from '../errors/api.exception';

export class ZodPipe<T extends z.ZodType> implements PipeTransform<unknown, z.infer<T>> {
  constructor(private readonly schema: T) {}

  transform(value: unknown): z.infer<T> {
    const result = this.schema.safeParse(value ?? {});
    if (result.success) return result.data;
    throw new ApiException(
      400,
      'VALIDATION_FAILED',
      'Certaines données sont invalides.',
      result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    );
  }
}
