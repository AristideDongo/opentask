import { useActionData, useSearchParams } from 'react-router';
import { Alert } from '../../shared/components/alert';
import { TextLink } from '../../shared/components/text-link';
import { useI18n } from '../../shared/hooks/useI18n';
import { safeRedirect } from '../../shared/utils/safe-redirect';
import { RegisterForm } from './components/register-form';
import { registerAction } from './servers/register.actions';

export const clientAction = registerAction;

export default function RegisterPage() {
  const { t, errorMessage } = useI18n();
  const result = useActionData<typeof registerAction>();
  const [params] = useSearchParams();
  const redirectTo = safeRedirect(params.get('redirectTo'));

  if (result?.ok) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t('auth.register.title')}</h1>
        <Alert tone="success">
          {t('auth.register.checkEmail', { email: result.data.pendingVerification })}
        </Alert>
        <TextLink to="/login">{t('auth.backToLogin')}</TextLink>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('auth.register.title')}</h1>
      {result && !result.ok && <Alert tone="error">{errorMessage(result.error)}</Alert>}
      <RegisterForm />
      <p className="text-sm text-muted">
        {t('auth.register.hasAccount')}{' '}
        <TextLink
          to={redirectTo !== '/' ? `/login?redirectTo=${encodeURIComponent(redirectTo)}` : '/login'}
        >
          {t('auth.login.submit')}
        </TextLink>
      </p>
    </div>
  );
}
