import { useActionData } from 'react-router';
import { Alert } from '../../shared/components/alert';
import { TextLink } from '../../shared/components/text-link';
import { useI18n } from '../../shared/hooks/useI18n';
import { ForgotPasswordForm } from './components/forgot-password-form';
import { forgotPasswordAction } from './servers/forgot-password.actions';

export const clientAction = forgotPasswordAction;

export default function ForgotPasswordPage() {
  const { t, errorMessage } = useI18n();
  const result = useActionData<typeof forgotPasswordAction>();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('auth.forgot.title')}</h1>
      {result?.ok ? (
        <Alert tone="success">{t('auth.forgot.sent', { email: result.data.sentTo })}</Alert>
      ) : (
        <>
          <p className="text-muted">{t('auth.forgot.intro')}</p>
          {result && !result.ok && <Alert tone="error">{errorMessage(result.error)}</Alert>}
          <ForgotPasswordForm />
        </>
      )}
      <TextLink to="/login" className="inline-block text-sm">
        {t('auth.backToLogin')}
      </TextLink>
    </div>
  );
}
