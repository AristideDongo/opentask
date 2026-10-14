import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateInvitationInputSchema,
  type CreatedInvitation,
  type CreateInvitationInput,
} from '@opentask/contracts/invitations/invitation';
import type { AssignableRole } from '@opentask/contracts/workspaces/roles';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRevalidator } from 'react-router';
import { Alert } from '../../../shared/components/alert';
import { Button } from '../../../shared/components/button';
import { CopyField } from '../../../shared/components/copy-field';
import { Field, Input, Select } from '../../../shared/components/form-controls';
import { Section } from '../../../shared/components/section';
import { useI18n } from '../../../shared/hooks/useI18n';
import { inviteMember } from '../servers/members.service';

export function InviteForm({
  workspaceId,
  grantableRoles,
}: {
  workspaceId: string;
  grantableRoles: AssignableRole[];
}) {
  const { t, errorMessage, fieldError } = useI18n();
  const revalidator = useRevalidator();
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedInvitation | null>(null);
  const { register, handleSubmit, formState, reset } = useForm<CreateInvitationInput>({
    resolver: zodResolver(CreateInvitationInputSchema),
    defaultValues: { email: '', role: 'member' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setCreated(null);
    try {
      setCreated(await inviteMember(workspaceId, values));
      reset({ email: '', role: values.role });
      await revalidator.revalidate();
    } catch (e) {
      setError(errorMessage(e));
    }
  });

  return (
    <Section title={t('members.invite.title')}>
      <form
        onSubmit={onSubmit}
        noValidate
        className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem_auto] sm:items-start"
      >
        <Field
          label={t('members.invite.email')}
          error={fieldError('email', formState.errors.email)}
        >
          {(p) => (
            <Input
              {...p}
              {...register('email')}
              type="email"
              autoComplete="off"
              placeholder="nom@exemple.org"
            />
          )}
        </Field>
        <Field label={t('members.invite.role')}>
          {(p) => (
            <Select {...p} {...register('role')}>
              {grantableRoles.map((role) => (
                <option key={role} value={role}>
                  {t(`role.${role}`)}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Button type="submit" busy={formState.isSubmitting} className="sm:mt-[1.625rem]">
          {t('members.invite.submit')}
        </Button>
      </form>
      <div className="mt-4 space-y-3 empty:hidden">
        {error && <Alert tone="error">{error}</Alert>}
        {created && (
          <>
            <Alert tone="success">{t('members.invite.sent', { email: created.email })}</Alert>
            <p className="text-sm text-muted">{t('members.invite.linkHelp')}</p>
            <CopyField value={created.inviteUrl} label={t('members.invite.title')} />
          </>
        )}
      </div>
    </Section>
  );
}
