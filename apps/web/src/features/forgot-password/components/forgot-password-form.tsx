import { zodResolver } from '@hookform/resolvers/zod';
import {
  type ForgotPasswordInput,
  ForgotPasswordInputSchema,
} from '@opentask/contracts/auth/credentials';
import { useForm } from 'react-hook-form';
import { useNavigation, useSubmit } from 'react-router';
import { Button } from '../../../shared/components/button';
import { Field, Input } from '../../../shared/components/form-controls';
import { useI18n } from '../../../shared/hooks/useI18n';

export function ForgotPasswordForm() {
  const { t, fieldError } = useI18n();
  const submit = useSubmit();
  const navigation = useNavigation();
  const { register, handleSubmit, formState } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordInputSchema),
  });

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={handleSubmit((values) =>
        submit(values, { method: 'post', encType: 'application/json' }),
      )}
    >
      <Field label={t('auth.email')} error={fieldError('email', formState.errors.email)}>
        {(p) => <Input {...p} {...register('email')} type="email" autoComplete="email" autoFocus />}
      </Field>
      <Button type="submit" busy={navigation.state === 'submitting'} className="w-full">
        {t('auth.forgot.submit')}
      </Button>
    </form>
  );
}
