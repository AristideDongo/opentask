import { Outlet, useRouteError } from 'react-router';
import { ErrorState } from '../../shared/components/error-state';
import { workspaceLoader } from './servers/workspace.loader';

export const clientLoader = workspaceLoader;

export default function WorkspaceLayout() {
  return <Outlet />;
}

export function ErrorBoundary() {
  return <ErrorState error={useRouteError()} />;
}
