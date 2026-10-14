import { z } from 'zod';
import { EmailSchema } from '../common/primitives';

export const PASSWORD_MIN_LENGTH = 10;

export const PasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, { error: `Au moins ${PASSWORD_MIN_LENGTH} caractères.` })
  .max(128);

export const PersonNameSchema = z.string().trim().min(1, { error: 'Nom requis.' }).max(80);

export const RegisterInputSchema = z.object({
  name: PersonNameSchema,
  email: EmailSchema,
  password: PasswordSchema,
});
export type RegisterInput = z.infer<typeof RegisterInputSchema>;

export const LoginInputSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, { error: 'Mot de passe requis.' }).max(128),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

export const ForgotPasswordInputSchema = z.object({ email: EmailSchema });
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordInputSchema>;

export const ResetPasswordInputSchema = z.object({
  token: z.string().min(1),
  newPassword: PasswordSchema,
});
export type ResetPasswordInput = z.infer<typeof ResetPasswordInputSchema>;
