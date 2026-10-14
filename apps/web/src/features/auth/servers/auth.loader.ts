import { redirect } from 'react-router';
import { fetchMe } from '../../../shared/servers/session.service';
import { safeRedirect } from '../../../shared/utils/safe-redirect';

export async function authLoader({ request }: { request: Request }) {
  if (await fetchMe())
    throw redirect(safeRedirect(new URL(request.url).searchParams.get('redirectTo')));
  return null;
}
