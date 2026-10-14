import { useLoaderData, useNavigate } from 'react-router';
import { Alert } from '../../shared/components/alert';
import { PageHeader } from '../../shared/components/page-header';
import { useI18n } from '../../shared/hooks/useI18n';
import { useToast } from '../../shared/hooks/useToast';
import { useWorkspaceData } from '../../shared/hooks/useWorkspaceData';
import { DeleteTeamSection } from './components/delete-team-section';
import { EditTeamForm } from './components/edit-team-form';
import { TeamMembersSection } from './components/team-members-section';
import { TeamProjectsSection } from './components/team-projects-section';
import { useTeamMutation } from './hooks/useTeamMutation';
import { teamCandidates, toTeamMemberRows } from './mappers/team-member.mapper';
import { addTeamMember, deleteTeam, removeTeamMember, updateTeam } from './servers/team.service';
import { teamLoader } from './servers/team.loader';

export const clientLoader = teamLoader;

export default function TeamPage() {
  const { team } = useLoaderData<typeof teamLoader>();
  const { workspace, members, projects } = useWorkspaceData();
  const { t } = useI18n();
  const { notify } = useToast();
  const navigate = useNavigate();
  const { run, error } = useTeamMutation();
  const manage = workspace.permissions.canManageTeams;

  return (
    <>
      <PageHeader title={team.name}>
        {team.description || (manage ? null : t('team.readOnly'))}
      </PageHeader>
      <div className="space-y-6">
        {error && <Alert tone="error">{error}</Alert>}
        {manage && (
          <EditTeamForm
            key={`${team.name}-${team.description}`}
            team={team}
            onSave={(input) => void run(() => updateTeam(workspace.id, team.id, input))}
          />
        )}
        <TeamMembersSection
          rows={toTeamMemberRows(team, members)}
          candidates={teamCandidates(team, members)}
          manage={manage}
          onAdd={(userId) => run(() => addTeamMember(workspace.id, team.id, userId))}
          onRemove={(userId) => void run(() => removeTeamMember(workspace.id, team.id, userId))}
        />
        <TeamProjectsSection
          workspaceId={workspace.id}
          teamId={team.id}
          projects={projects.filter((p) => p.team?.id === team.id)}
          canCreate={workspace.permissions.canCreateProject}
        />
        {manage && (
          <DeleteTeamSection
            team={team}
            onDelete={async () => {
              await deleteTeam(workspace.id, team.id);
              notify(t('team.deleted'));
              navigate(`/w/${workspace.id}`);
            }}
          />
        )}
      </div>
    </>
  );
}
