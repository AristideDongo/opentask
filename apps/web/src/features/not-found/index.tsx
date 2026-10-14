import { data } from 'react-router';
import { ErrorState } from '../../shared/components/error-state';

export function clientLoader() {
  throw data(null, { status: 404 });
}

export default function NotFound() {
  return null;
}

export function ErrorBoundary() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6">
      <ErrorState error={{ status: 404, statusText: 'Not Found', internal: false, data: null }} />
    </main>
  );
}
