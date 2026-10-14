import type { WorkspaceRole } from '@opentask/contracts/workspaces/roles';

export interface ChannelAccessFacts {
  isPrivate: boolean;
  isChannelMember: boolean;
  createdById: string | null;
}

export interface ChannelActor {
  userId: string;
  role: WorkspaceRole;
}

export interface MessageFacts {
  authorId: string | null;
  deletedAt: Date | null;
}

export interface ChannelAudience {
  minRole?: WorkspaceRole;
  userIds: string[];
}
