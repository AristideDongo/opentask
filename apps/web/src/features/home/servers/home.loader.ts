import { redirect } from 'react-router';
import { fetchWorkspaces } from '../../../shared/servers/session.service';
import { lastWorkspace } from '../../../shared/utils/last-workspace';

export async function homeLoader() {
  const { items } = await fetchWorkspaces();
  if (items.length === 0) throw redirect('/onboarding');
  const preferred = items.find((w) => w.id === lastWorkspace()) ?? items[0]!;
  throw redirect(`/w/${preferred.id}`);
}
