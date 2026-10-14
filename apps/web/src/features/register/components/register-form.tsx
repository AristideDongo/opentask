import { zodResolver } from '@hookform/resolvers/zod';
import { type RegisterInput, RegisterInputSchema } from '@opentask/contracts/auth/credentials';
import { useForm } from 'react-hook-form';
import { useNavigation, useSubmit } from 'react-router';
import { Button } from '../../../shared/components/button';
import { Field, Input } from '../../../shared/components/form-controls';
import { useI18n } from '../../../shared/hooks/useI18n';

export function RegisterForm() {
  const { t, fieldError } = useI18n();
  const submit = useSubmit();
  const navigation = useNavigation();
  const { register, handleSubmit, formState } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterInputSchema),
  });

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={handleSubmit((values) =>
        submit(values, { method: 'post', encType: 'application/json' }),
      )}
    >
      <Field label={t('auth.name')} error={fieldError('name', formState.errors.name)}>
        {(p) => <Input {...p} {...register('name')} autoComplete="name" autoFocus />}
      </Field>
      <Field label={t('auth.email')} error={fieldError('email', formState.errors.email)}>
        {(p) => <Input {...p} {...register('email')} type="email" autoComplete="email" />}
      </Field>
      <Field
        label={t('auth.password')}
        hint={t('auth.passwordHint')}
        error={fieldError('password', formState.errors.password)}
      >
        {(p) => (
          <Input {...p} {...register('password')} type="password" autoComplete="new-password" />
        )}
      </Field>
      <Button type="submit" busy={navigation.state === 'submitting'} className="w-full">
        {t('auth.register.submit')}
      </Button>
    </form>
  );
}
