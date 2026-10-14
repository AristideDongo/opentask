import type { IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'node:http';
import { betterAuth } from 'better-auth';
import { fromNodeHeaders, toNodeHandler } from 'better-auth/node';
import { CLIENT_IP_HEADER } from './auth.const';
import { authOptions } from './auth.options';
import type { AuthDependencies, AuthSettings, SessionUser } from './auth.types';

export function createAuth(settings: AuthSettings, dependencies: AuthDependencies) {
  const auth = betterAuth(authOptions(settings, dependencies));
  const nodeHandler = toNodeHandler(auth);

  return {
    async sessionUser(headers: IncomingHttpHeaders): Promise<SessionUser | null> {
      const session = await auth.api.getSession({ headers: fromNodeHeaders(headers) });
      return session ? { id: session.user.id, email: session.user.email } : null;
    },
    handle(req: IncomingMessage, res: ServerResponse, clientIp: string) {
      req.headers[CLIENT_IP_HEADER] = clientIp;
      return nodeHandler(req, res);
    },
  };
}

export type Auth = ReturnType<typeof createAuth>;
