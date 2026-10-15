import { zodResolver } from '@hookform/resolvers/zod';
import {
  API_TOKEN_LIFETIMES,
  API_TOKEN_SCOPES,
  CreateApiTokenInputSchema,
  type CreateApiTokenData,
  type CreateApiTokenInput,
} from '@opentask/contracts/tokens/api-token';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useRevalidator } from 'react-router';
import { Alert } from '../../../shared/components/alert';
import { Button } from '../../../shared/components/button';
import { CopyField } from '../../../shared/components/copy-field';
import { Field, Input, Select } from '../../../shared/components/form-controls';
import { useI18n } from '../../../shared/hooks/useI18n';
import { createApiToken } from '../servers/profile.service';

export function CreateApiTokenForm() {
  const { t, errorMessage, fieldError } = useI18n();
  const revalidator = useRevalidator();
  const [error, setError] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const { register, handleSubmit, formState, reset, control } = useForm<
    CreateApiTokenInput,
    unknown,
    CreateApiTokenData
  >({
    resolver: zodResolver(CreateApiTokenInputSchema),
    defaultValues: { name: '', scopes: ['read'], expiresInDays: 90 },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setSecret(null);
    try {
      const created = await createApiToken(values);
      setSecret(created.token);
      reset({ name: '', scopes: ['read'], expiresInDays: 90 });
      await revalidator.revalidate();
    } catch (e) {
      setError(errorMessage(e));
    }
  });

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field label={t('tokens.name')} error={fieldError('name', formState.errors.name)}>
          {(p) => (
            <Input
              {...p}
              {...register('name')}
              maxLength={40}
              placeholder={t('tokens.namePlaceholder')}
            />
          )}
        </Field>
        <Field label={t('tokens.lifetime')}>
          {(p) => (
            <Select {...p} {...register('expiresInDays', { valueAsNumber: true })}>
              {API_TOKEN_LIFETIMES.map((days) => (
                <option key={days} value={days}>
                  {t('tokens.lifetime.days', { days })}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <fieldset className="sm:col-span-2">
          <legend className="mb-1.5 text-sm font-semibold">{t('tokens.scopes')}</legend>
          <Controller
            control={control}
            name="scopes"
            render={({ field }) => (
              <div className="space-y-1.5">
                {API_TOKEN_SCOPES.map((scope) => {
                  const checked = field.value?.includes(scope) ?? false;
                  return (
                    <label key={scope} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          field.onChange(
                            checked
                              ? (field.value ?? []).filter((s) => s !== scope)
                              : [...(field.value ?? []), scope],
                          )
                        }
                        className="size-4 accent-[var(--accent)]"
                      />
                      {t(`tokens.scope.${scope}`)}
                    </label>
                  );
                })}
              </div>
            )}
          />
          {formState.errors.scopes && (
            <p className="mt-1 text-sm text-danger">{formState.errors.scopes.message}</p>
          )}
        </fieldset>
        <div className="sm:col-span-2">
          <Button type="submit" busy={formState.isSubmitting}>
            {t('tokens.create')}
          </Button>
        </div>
      </form>
      {error && <Alert tone="error">{error}</Alert>}
      {secret && (
        <div className="space-y-2">
          <Alert tone="success">{t('tokens.created')}</Alert>
          <CopyField value={secret} label={t('tokens.title')} />
        </div>
      )}
    </div>
  );
}
