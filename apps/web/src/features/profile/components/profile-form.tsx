import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useActionData, useNavigation, useSubmit } from 'react-router';
import { Alert } from '../../../shared/components/alert';
import { Button } from '../../../shared/components/button';
import { Field, Input, Select } from '../../../shared/components/form-controls';
import { useI18n } from '../../../shared/hooks/useI18n';
import { useToast } from '../../../shared/hooks/useToast';
import type { MeVM } from '../../../shared/types/person.types';
import { useTimezones } from '../hooks/useTimezones';
import { type ProfileForm as ProfileValues, ProfileFormSchema } from '../profile.validators';
import type { profileAction } from '../servers/profile.actions';

export function ProfileForm({ me }: { me: MeVM }) {
  const { t, errorMessage, fieldError, setLocale } = useI18n();
  const { notify } = useToast();
  const submit = useSubmit();
  const navigation = useNavigation();
  const result = useActionData<typeof profileAction>();
  const timezones = useTimezones();
  const { register, handleSubmit, formState, reset } = useForm<ProfileValues>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: { name: me.name, locale: me.locale, timezone: me.timezone },
  });

  useEffect(() => {
    if (!result?.ok) return;
    setLocale(result.data.locale);
    reset({ name: result.data.name, locale: result.data.locale, timezone: result.data.timezone });
    notify(t('common.saved'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  return (
    <form
      noValidate
      className="max-w-md space-y-5"
      onSubmit={handleSubmit((values) =>
        submit(values, { method: 'post', encType: 'application/json' }),
      )}
    >
      {result && !result.ok && <Alert tone="error">{errorMessage(result.error)}</Alert>}
      <Field label={t('auth.name')} error={fieldError('name', formState.errors.name)}>
        {(p) => <Input {...p} {...register('name')} autoComplete="name" />}
      </Field>
      <Field label={t('profile.language')}>
        {(p) => (
          <Select {...p} {...register('locale')}>
            <option value="fr">Français</option>
            <option value="en">English</option>
          </Select>
        )}
      </Field>
      <Field
        label={t('profile.timezone')}
        error={fieldError('timezone', formState.errors.timezone)}
      >
        {(p) => (
          <Select {...p} {...register('timezone')}>
            {!timezones.includes(me.timezone) && <option value={me.timezone}>{me.timezone}</option>}
            {timezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replaceAll('_', ' ')}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Button type="submit" busy={navigation.state === 'submitting'} disabled={!formState.isDirty}>
        {t('common.save')}
      </Button>
    </form>
  );
}
