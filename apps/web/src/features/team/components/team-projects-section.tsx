import { FolderKanban } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../../../shared/components/button';
import { CreateProjectDialog } from '../../../shared/components/create-project-dialog';
import { Section } from '../../../shared/components/section';
import { useI18n } from '../../../shared/hooks/useI18n';
import type { ProjectVM } from '../../../shared/types/project.types';

export function TeamProjectsSection({
  workspaceId,
  teamId,
  projects,
  canCreate,
}: {
  workspaceId: string;
  teamId: string;
  projects: ProjectVM[];
  canCreate: boolean;
}) {
  const { t } = useI18n();
  return (
    <Section title={t('team.projects')}>
      {projects.length === 0 ? (
        <p className="text-muted">{t('team.noProjects')}</p>
      ) : (
        <ul className="divide-y divide-line">
          {projects.map((p) => (
            <li key={p.id} className="py-2.5">
              <Link
                to={`/w/${workspaceId}/p/${p.id}`}
                className="inline-flex items-center gap-2 font-semibold hover:underline"
              >
                <FolderKanban aria-hidden className="size-4 text-muted" />
                {p.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {canCreate && (
        <div className="mt-4">
          <CreateProjectDialog
            defaultTeamId={teamId}
            trigger={<Button variant="secondary">{t('nav.newProject')}</Button>}
          />
        </div>
      )}
    </Section>
  );
}
