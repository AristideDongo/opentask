import { clsx } from 'clsx';
import { Logo } from '../../../shared/components/logo';
import { useI18n } from '../../../shared/hooks/useI18n';
import type { WorkspaceData } from '../../../shared/types/route-data.types';
import type { MeVM } from '../../../shared/types/person.types';
import type { WorkspaceVM } from '../../../shared/types/workspace.types';
import { AccountFooter } from './account-footer';
import { WorkspaceNav } from './workspace-nav';
import { WorkspaceSwitcher } from './workspace-switcher';

export function Sidebar({
  me,
  workspaces,
  data,
  open,
}: {
  me: MeVM;
  workspaces: WorkspaceVM[];
  data: WorkspaceData | undefined;
  open: boolean;
}) {
  const { t } = useI18n();
  return (
    <aside
      id="sidebar"
      className={clsx(
        'flex-col border-line bg-surface lg:sticky lg:top-0 lg:flex lg:h-dvh lg:border-r',
        open ? 'flex border-b' : 'hidden',
      )}
    >
      <div className="hidden items-center gap-2.5 px-5 pt-5 pb-3 lg:flex">
        <Logo />
        <span className="text-lg font-bold">{t('app.name')}</span>
      </div>
      <div className="px-3 pt-3 lg:pt-0">
        <WorkspaceSwitcher current={data?.workspace} workspaces={workspaces} />
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3">{data && <WorkspaceNav data={data} />}</div>
      <AccountFooter me={me} />
    </aside>
  );
}
