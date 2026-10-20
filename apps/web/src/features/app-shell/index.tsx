import { clsx } from 'clsx';
import { Outlet, useLoaderData, useMatches, useParams } from 'react-router';
import { RealtimeProvider } from '../../shared/components/realtime-provider';
import { useI18n } from '../../shared/hooks/useI18n';
import { useOptionalWorkspaceData } from '../../shared/hooks/useWorkspaceData';
import { MentionNotifier } from './components/mention-notifier';
import { MobileTopBar } from './components/mobile-top-bar';
import { Sidebar } from './components/sidebar';
import { useCloseOnNavigation } from './hooks/useCloseOnNavigation';
import { useProfileLocale } from './hooks/useProfileLocale';
import { appShellLoader, appShellShouldRevalidate } from './servers/app-shell.loader';

export const clientLoader = appShellLoader;
export const shouldRevalidate = appShellShouldRevalidate;

export default function AppShell() {
  const { me, workspaces } = useLoaderData<typeof appShellLoader>();
  const { t } = useI18n();
  const { workspaceId } = useParams();
  const workspaceData = useOptionalWorkspaceData();
  const [menuOpen, setMenuOpen] = useCloseOnNavigation();
  const fullWidth = useMatches().some(
    (m) => (m.handle as { fullWidth?: boolean } | undefined)?.fullWidth,
  );
  useProfileLocale(me.locale);

  return (
    <RealtimeProvider
      workspaceId={workspaceData ? workspaceId : undefined}
      meId={me.id}
      channels={workspaceData?.channels}
    >
      {workspaceData && workspaceId && <MentionNotifier workspaceId={workspaceId} />}
      <div className="min-h-dvh lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-surface focus:px-3 focus:py-2"
        >
          {t('nav.skip')}
        </a>
        <MobileTopBar open={menuOpen} onToggle={() => setMenuOpen((v) => !v)} />
        <Sidebar me={me} workspaces={workspaces} data={workspaceData} open={menuOpen} />
        <main
          id="main"
          tabIndex={-1}
          className={clsx(
            'min-w-0',
            fullWidth ? 'lg:h-dvh lg:overflow-hidden' : 'px-4 py-8 sm:px-8 lg:px-10 lg:py-8',
          )}
        >
          {fullWidth ? (
            <Outlet />
          ) : (
            <div className="mx-auto max-w-4xl">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </RealtimeProvider>
  );
}
