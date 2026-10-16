import { APP_HOME } from '../constants/paths';
import { useAuthStatus } from '../hooks/useAuthStatus';
import { LinkButton } from './link-button';

export function AuthActions({
  labels,
}: {
  labels: { login: string; register: string; openApp: string };
}) {
  const status = useAuthStatus();
  if (status === 'signed-in') {
    return (
      <LinkButton to={APP_HOME} size="sm">
        {labels.openApp}
      </LinkButton>
    );
  }
  return (
    <span className="flex items-center gap-2">
      <LinkButton to="/login" variant="ghost" size="sm">
        {labels.login}
      </LinkButton>
      <LinkButton to="/register" size="sm">
        {labels.register}
      </LinkButton>
    </span>
  );
}
