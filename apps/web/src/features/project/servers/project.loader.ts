import type { ShouldRevalidateFunctionArgs } from 'react-router';
import { toProjectVM } from '../../../shared/mappers/project.mapper';
import { toTaskVM } from '../../../shared/mappers/task.mapper';
import { toTaskQuery } from '../mappers/task-query.mapper';
import { fetchProject, fetchProjectTasks } from './project.service';

export async function projectLoader({
  params,
  request,
}: {
  params: { workspaceId?: string; projectId?: string };
  request: Request;
}) {
  const workspaceId = params.workspaceId ?? '';
  const projectId = params.projectId ?? '';
  const query = toTaskQuery(new URL(request.url).searchParams);
  const [project, tasks] = await Promise.all([
    fetchProject(workspaceId, projectId),
    fetchProjectTasks(workspaceId, projectId, query),
  ]);
  return { project: toProjectVM(project), tasks: tasks.items.map(toTaskVM) };
}

const listPath = (url: URL) => url.pathname.split('/t/')[0];

export function projectShouldRevalidate({
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  if (currentUrl.href === nextUrl.href) return defaultShouldRevalidate;
  const opening = !currentUrl.pathname.includes('/t/') && nextUrl.pathname.includes('/t/');
  const sameList =
    listPath(currentUrl) === listPath(nextUrl) && currentUrl.search === nextUrl.search;
  if (opening && sameList) return false;
  return defaultShouldRevalidate;
}
