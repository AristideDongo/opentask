import type { ChannelVM } from './channel.types';
import type { MeVM } from './person.types';
import type { ProjectVM } from './project.types';
import type { TeamVM } from './team.types';
import type { MemberVM, WorkspaceVM } from './workspace.types';

export interface SessionData {
  me: MeVM;
  workspaces: WorkspaceVM[];
}

export interface WorkspaceData {
  workspace: WorkspaceVM;
  projects: ProjectVM[];
  channels: ChannelVM[];
  teams: TeamVM[];
  members: MemberVM[];
}
