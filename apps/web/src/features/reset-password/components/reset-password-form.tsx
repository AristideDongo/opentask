import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigation, useSubmit } from 'react-router';
import { Button } from '../../../shared/components/button';
import { Field, Input } from '../../../shared/components/form-controls';
import { useI18n } from '../../../shared/hooks/useI18n';
import { type NewPasswordForm, NewPasswordFormSchema } from '../reset-password.validators';

export function ResetPasswordForm({ token }: { token: string }) {
  const { t, fieldError } = useI18n();
  const submit = useSubmit();
  const navigation = useNavigation();
  const { register, handleSubmit, formState } = useForm<NewPasswordForm>({
    resolver: zodResolver(NewPasswordFormSchema),
  });

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={handleSubmit(({ newPassword }) =>
        submit({ token, newPassword }, { method: 'post', encType: 'application/json' }),
      )}
    >
      <Field
        label={t('auth.reset.newPassword')}
        hint={t('auth.passwordHint')}
        error={fieldError('password', formState.errors.newPassword)}
      >
        {(p) => (
          <Input
            {...p}
            {...register('newPassword')}
            type="password"
            autoComplete="new-password"
            autoFocus
          />
        )}
      </Field>
      <Button type="submit" busy={navigation.state === 'submitting'} className="w-full">
        {t('auth.reset.submit')}
      </Button>
    </form>
  );
}
