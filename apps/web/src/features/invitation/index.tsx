import { Link, useActionData, useLoaderData, useParams } from 'react-router';
import { Alert } from '../../shared/components/alert';
import { Logo } from '../../shared/components/logo';
import { useI18n } from '../../shared/hooks/useI18n';
import { InvitationCard } from './components/invitation-card';
import { invitationAction } from './servers/invitation.actions';
import { invitationLoader } from './servers/invitation.loader';

export const clientLoader = invitationLoader;
export const clientAction = invitationAction;

export default function InvitationPage() {
  const { preview, meEmail } = useLoaderData<typeof invitationLoader>();
  const result = useActionData<typeof invitationAction>();
  const { token } = useParams();
  const { t, errorMessage } = useI18n();

  return (
    <main
      id="main"
      className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-10 px-6 py-10"
    >
      <Link to="/" className="flex items-center gap-2.5 self-start">
        <Logo />
        <span className="text-lg font-bold">{t('app.name')}</span>
      </Link>
      {preview ? (
        <InvitationCard preview={preview} meEmail={meEmail} here={`/invite/${token}`} />
      ) : (
        <Alert tone="error">{t('invite.invalid')}</Alert>
      )}
      {result && !result.ok && <Alert tone="error">{errorMessage(result.error)}</Alert>}
    </main>
  );
}
