import { type ShouldRevalidateFunctionArgs, redirect } from 'react-router';
import { toMeVM } from '../../../shared/mappers/person.mapper';
import { toWorkspaceVM } from '../../../shared/mappers/workspace.mapper';
import { fetchMe, fetchWorkspaces } from '../../../shared/servers/session.service';
import type { SessionData } from '../../../shared/types/route-data.types';

export async function appShellLoader({ request }: { request: Request }): Promise<SessionData> {
  const me = await fetchMe();
  if (!me) {
    const url = new URL(request.url);
    throw redirect(`/login?redirectTo=${encodeURIComponent(url.pathname + url.search)}`);
  }
  const { items } = await fetchWorkspaces();
  return { me: toMeVM(me), workspaces: items.map(toWorkspaceVM) };
}

export function appShellShouldRevalidate({
  currentParams,
  nextParams,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  return currentParams.workspaceId !== nextParams.workspaceId || defaultShouldRevalidate;
}
