import { PasswordSchema } from '@opentask/contracts/auth/credentials';
import { z } from 'zod';

export const NewPasswordFormSchema = z.object({ newPassword: PasswordSchema });
export type NewPasswordForm = z.infer<typeof NewPasswordFormSchema>;
