import { useActionData, useSearchParams } from 'react-router';
import { Alert } from '../../shared/components/alert';
import { TextLink } from '../../shared/components/text-link';
import { useI18n } from '../../shared/hooks/useI18n';
import { safeRedirect } from '../../shared/utils/safe-redirect';
import { LoginForm } from './components/login-form';
import { loginAction } from './servers/login.actions';

export const clientAction = loginAction;

export default function LoginPage() {
  const { t, errorMessage } = useI18n();
  const result = useActionData<typeof loginAction>();
  const [params] = useSearchParams();
  const redirectTo = safeRedirect(params.get('redirectTo'));
  const registerUrl =
    redirectTo !== '/' ? `/register?redirectTo=${encodeURIComponent(redirectTo)}` : '/register';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('auth.login.title')}</h1>
      {params.get('reset') === '1' && <Alert tone="success">{t('auth.reset.done')}</Alert>}
      {result && !result.ok && <Alert tone="error">{errorMessage(result.error)}</Alert>}
      <LoginForm />
      <div className="space-y-2 text-sm">
        <p>
          <TextLink to="/forgot-password">{t('auth.login.forgot')}</TextLink>
        </p>
        <p className="text-muted">
          {t('auth.login.noAccount')}{' '}
          <TextLink to={registerUrl}>{t('auth.login.createAccount')}</TextLink>
        </p>
      </div>
    </div>
  );
}
