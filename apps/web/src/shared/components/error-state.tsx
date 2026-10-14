import { Link, isRouteErrorResponse } from 'react-router';
import { useI18n } from '../hooks/useI18n';
import { ApiRequestError } from '../utils/api-client';

export function ErrorState({ error, title }: { error: unknown; title?: string }) {
  const { t, errorMessage } = useI18n();
  const notFound =
    (isRouteErrorResponse(error) && error.status === 404) ||
    (error instanceof ApiRequestError && error.status === 404);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">
        {title ?? (notFound ? t('error.notFound.title') : t('error.title'))}
      </h1>
      <p className="text-muted">{notFound ? t('error.notFound.body') : errorMessage(error)}</p>
      <Link to="/" className="inline-block font-semibold text-accent underline underline-offset-4">
        {t('common.backHome')}
      </Link>
    </div>
  );
}
