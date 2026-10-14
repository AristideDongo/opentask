const KEY = 'opentask.lastWorkspace';

export function rememberWorkspace(id: string) {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    return;
  }
}

export function lastWorkspace(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}
