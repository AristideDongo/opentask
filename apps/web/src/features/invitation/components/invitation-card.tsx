import type { InvitationPreview } from '@opentask/contracts/invitations/invitation';
import { Form, Link, useNavigation } from 'react-router';
import { Alert } from '../../../shared/components/alert';
import { Button } from '../../../shared/components/button';
import { useI18n } from '../../../shared/hooks/useI18n';

const linkButton =
  'inline-flex h-10 items-center rounded-[var(--radius-control)] px-4 font-semibold';

export function InvitationCard({
  preview,
  meEmail,
  here,
}: {
  preview: InvitationPreview;
  meEmail: string | null;
  here: string;
}) {
  const { t } = useI18n();
  const navigation = useNavigation();
  const role = t(`role.${preview.role}`).toLowerCase();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">
        {t('invite.title', { workspace: preview.workspaceName })}
      </h1>
      <p className="text-muted">
        {preview.inviterName
          ? t('invite.body', { inviter: preview.inviterName, role })
          : t('invite.bodyNoInviter', { role })}
      </p>
      <p className="text-sm text-muted">{t('invite.for', { email: preview.email })}</p>
      {preview.status !== 'pending' ? (
        <Alert tone="error">{t(`invite.status.${preview.status}`)}</Alert>
      ) : !meEmail ? (
        <div className="space-y-4">
          <p>{t('invite.loginToAccept')}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/login?redirectTo=${encodeURIComponent(here)}`}
              className={`${linkButton} bg-accent text-accent-ink hover:bg-accent-hover`}
            >
              {t('auth.login.submit')}
            </Link>
            <Link
              to={`/register?redirectTo=${encodeURIComponent(here)}`}
              className={`${linkButton} border border-line bg-surface hover:bg-sunken`}
            >
              {t('auth.login.createAccount')}
            </Link>
          </div>
        </div>
      ) : meEmail.toLowerCase() !== preview.email ? (
        <Alert tone="error">{t('invite.wrongAccount', { email: meEmail })}</Alert>
      ) : (
        <Form method="post">
          <Button type="submit" busy={navigation.state === 'submitting'}>
            {t('invite.accept')}
          </Button>
        </Form>
      )}
    </div>
  );
}
