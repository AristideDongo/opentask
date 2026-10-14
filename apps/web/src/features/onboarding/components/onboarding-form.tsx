import { zodResolver } from '@hookform/resolvers/zod';
import {
  type CreateWorkspaceInput,
  CreateWorkspaceInputSchema,
} from '@opentask/contracts/workspaces/workspace';
import { useForm } from 'react-hook-form';
import { useNavigation, useSubmit } from 'react-router';
import { Button } from '../../../shared/components/button';
import { Field, Input } from '../../../shared/components/form-controls';
import { useI18n } from '../../../shared/hooks/useI18n';

export function OnboardingForm() {
  const { t, fieldError } = useI18n();
  const submit = useSubmit();
  const navigation = useNavigation();
  const { register, handleSubmit, formState } = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(CreateWorkspaceInputSchema),
  });

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={handleSubmit((values) =>
        submit(values, { method: 'post', encType: 'application/json' }),
      )}
    >
      <Field label={t('workspace.name')} error={fieldError('name', formState.errors.name)}>
        {(p) => (
          <Input
            {...p}
            {...register('name')}
            placeholder={t('workspace.namePlaceholder')}
            autoFocus
          />
        )}
      </Field>
      <Button type="submit" busy={navigation.state === 'submitting'}>
        {t('workspace.create')}
      </Button>
    </form>
  );
}
