import { clsx } from 'clsx';
import {
  CheckSquare,
  FolderKanban,
  Hash,
  LayoutGrid,
  Lock,
  Settings,
  Users,
  UsersRound,
} from 'lucide-react';
import { NavLink } from 'react-router';
import { CreateChannelDialog } from '../../../shared/components/create-channel-dialog';
import { CreateProjectDialog } from '../../../shared/components/create-project-dialog';
import { CreateTeamDialog } from '../../../shared/components/create-team-dialog';
import { useI18n } from '../../../shared/hooks/useI18n';
import { useRealtime } from '../../../shared/hooks/useRealtime';
import type { WorkspaceData } from '../../../shared/types/route-data.types';
import { navItemClass } from '../app-shell.const';
import { AddButton, NavSection } from './nav-section';

export function WorkspaceNav({ data }: { data: WorkspaceData }) {
  const { t } = useI18n();
  const { unread, connected } = useRealtime();
  const { workspace, projects, channels, teams } = data;
  const base = `/w/${workspace.id}`;
  const { permissions } = workspace;

  return (
    <nav aria-label={workspace.name} className="space-y-5">
      <ul className="space-y-0.5">
        <li>
          <NavLink to={base} end className={navItemClass}>
            <LayoutGrid aria-hidden className="size-4" />
            {t('nav.home')}
          </NavLink>
        </li>
        <li>
          <NavLink to={`${base}/my-tasks`} className={navItemClass}>
            <CheckSquare aria-hidden className="size-4" />
            {t('nav.myTasks')}
          </NavLink>
        </li>
        <li>
          <NavLink to={`${base}/members`} className={navItemClass}>
            <Users aria-hidden className="size-4" />
            {t('nav.members')}
          </NavLink>
        </li>
        <li>
          <NavLink to={`${base}/settings`} className={navItemClass}>
            <Settings aria-hidden className="size-4" />
            {t('nav.settings')}
          </NavLink>
        </li>
      </ul>

      <NavSection
        title={t('nav.projects')}
        action={
          permissions.canCreateProject && (
            <CreateProjectDialog trigger={<AddButton label={t('nav.newProject')} />} />
          )
        }
      >
        {projects.length === 0 ? (
          <li className="px-2.5 text-sm text-muted">{t('nav.noProjects')}</li>
        ) : (
          projects.map((p) => (
            <li key={p.id}>
              <NavLink to={`${base}/p/${p.id}`} className={navItemClass}>
                <FolderKanban aria-hidden className="size-4 shrink-0" />
                <span className="truncate">{p.name}</span>
              </NavLink>
            </li>
          ))
        )}
      </NavSection>

      <NavSection
        title={t('nav.channels')}
        action={
          permissions.canCreateChannel && (
            <CreateChannelDialog trigger={<AddButton label={t('nav.newChannel')} />} />
          )
        }
        status={
          <span
            title={connected ? t('nav.live') : t('nav.offline')}
            className={clsx('size-2 rounded-full', connected ? 'bg-accent' : 'bg-line')}
          >
            <span className="sr-only">{connected ? t('nav.live') : t('nav.offline')}</span>
          </span>
        }
      >
        {channels.map((c) => {
          const count = unread(c.id);
          const Icon = c.isPrivate ? Lock : Hash;
          return (
            <li key={c.id}>
              <NavLink to={`${base}/c/${c.id}`} className={navItemClass}>
                <Icon aria-hidden className="size-4 shrink-0" />
                <span className={clsx('truncate', count > 0 && 'font-semibold text-ink')}>
                  {c.name}
                </span>
                {count > 0 && (
                  <span className="ml-auto rounded-full bg-accent px-1.5 text-xs font-bold text-accent-ink">
                    {count > 99 ? '99+' : count}
                    <span className="sr-only"> {t('nav.unread', { count })}</span>
                  </span>
                )}
              </NavLink>
            </li>
          );
        })}
      </NavSection>

      <NavSection
        title={t('nav.teams')}
        action={
          permissions.canManageTeams && (
            <CreateTeamDialog trigger={<AddButton label={t('nav.newTeam')} />} />
          )
        }
      >
        {teams.length === 0 ? (
          <li className="px-2.5 text-sm text-muted">{t('nav.noTeams')}</li>
        ) : (
          teams.map((team) => (
            <li key={team.id}>
              <NavLink to={`${base}/teams/${team.id}`} className={navItemClass}>
                <UsersRound aria-hidden className="size-4 shrink-0" />
                <span className="truncate">{team.name}</span>
                <span className="ml-auto text-xs text-muted">{team.members.length}</span>
              </NavLink>
            </li>
          ))
        )}
      </NavSection>
    </nav>
  );
}
