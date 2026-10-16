import { useEffect, useState } from 'react';
import { fetchMe } from '../servers/session.service';

export type AuthStatus = 'unknown' | 'guest' | 'signed-in';

export function useAuthStatus(): AuthStatus {
  const [status, setStatus] = useState<AuthStatus>('unknown');
  useEffect(() => {
    let active = true;
    fetchMe()
      .then((me) => active && setStatus(me ? 'signed-in' : 'guest'))
      .catch(() => active && setStatus('guest'));
    return () => {
      active = false;
    };
  }, []);
  return status;
}
