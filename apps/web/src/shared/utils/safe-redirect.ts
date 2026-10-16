import { APP_HOME } from '../constants/paths';

export function safeRedirect(target: string | null | undefined, fallback = APP_HOME): string {
  if (!target || !target.startsWith('/') || target.startsWith('//') || target.startsWith('/\\'))
    return fallback;
  return target;
}
