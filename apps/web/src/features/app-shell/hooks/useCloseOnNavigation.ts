import { useState } from 'react';
import { useLocation } from 'react-router';

export function useCloseOnNavigation() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const [lastPath, setLastPath] = useState(location.pathname);
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname);
    setOpen(false);
  }
  return [open, setOpen] as const;
}
