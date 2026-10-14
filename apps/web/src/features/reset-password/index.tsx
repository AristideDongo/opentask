import { useActionData, useSearchParams } from 'react-router';
import { Alert } from '../../shared/components/alert';
import { TextLink } from '../../shared/components/text-link';
import { useI18n } from '../../shared/hooks/useI18n';
import { ResetPasswordForm } from './components/reset-password-form';
import { resetPasswordAction } from './servers/reset-password.actions';

export const clientAction = resetPasswordAction;

export default function ResetPasswordPage() {
  const { t, errorMessage } = useI18n();
  const result = useActionData<typeof resetPasswordAction>();
  const [params] = useSearchParams();
  const token = params.get('token');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('auth.reset.title')}</h1>
      {!token || params.get('error') ? (
        <>
          <Alert tone="error">{t('auth.reset.invalid')}</Alert>
          <TextLink to="/forgot-password">{t('auth.forgot.title')}</TextLink>
        </>
      ) : (
        <>
          {result && !result.ok && <Alert tone="error">{errorMessage(result.error)}</Alert>}
          <ResetPasswordForm token={token} />
        </>
      )}
    </div>
  );
}
