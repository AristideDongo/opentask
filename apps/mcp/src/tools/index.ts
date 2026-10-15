import { getCurrentUserTool } from './read/get-current-user.tool';
import { getProjectSummaryTool } from './read/get-project-summary.tool';
import { getTaskTool } from './read/get-task.tool';
import { listCommentsTool } from './read/list-comments.tool';
import { listMyTasksTool } from './read/list-my-tasks.tool';
import { listProjectsTool } from './read/list-projects.tool';
import { listTasksTool } from './read/list-tasks.tool';
import { listWorkspacesTool } from './read/list-workspaces.tool';
import { searchTool } from './read/search.tool';
import type { ToolDefinition } from './tool.types';
import { addCommentTool } from './write/add-comment.tool';
import { assignTaskTool } from './write/assign-task.tool';
import { changeTaskStatusTool } from './write/change-task-status.tool';
import { createTaskTool } from './write/create-task.tool';
import { updateTaskTool } from './write/update-task.tool';

export const TOOLS: ToolDefinition[] = [
  getCurrentUserTool,
  listWorkspacesTool,
  listProjectsTool,
  listTasksTool,
  getTaskTool,
  searchTool,
  listCommentsTool,
  getProjectSummaryTool,
  listMyTasksTool,
  createTaskTool,
  updateTaskTool,
  changeTaskStatusTool,
  assignTaskTool,
  addCommentTool,
];
