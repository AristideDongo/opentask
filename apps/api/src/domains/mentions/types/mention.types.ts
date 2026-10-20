import type { WorkspaceRole } from '@opentask/contracts/workspaces/roles';

export interface MentionCandidate {
  id: string;
  name: string;
  role: WorkspaceRole;
  isChannelMember: boolean;
}

export interface MentionRef {
  id: string;
  name: string;
}
