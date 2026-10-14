import { Outlet } from 'react-router';
import { AuthAside } from './components/auth-aside';
import { authLoader } from './servers/auth.loader';

export const clientLoader = authLoader;

export default function AuthLayout() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <AuthAside />
      <main
        id="main"
        className="flex items-start justify-center px-6 py-10 sm:px-10 lg:items-center"
      >
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
