import { useState } from 'react';
import { useRevalidator } from 'react-router';
import { useI18n } from '../../../shared/hooks/useI18n';

export function useProjectMutation() {
  const { errorMessage } = useI18n();
  const revalidator = useRevalidator();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (request: () => Promise<unknown>, onSuccess?: () => void) => {
    setBusy(true);
    setError(null);
    try {
      await request();
      onSuccess?.();
      await revalidator.revalidate();
      return true;
    } catch (e) {
      setError(errorMessage(e));
      return false;
    } finally {
      setBusy(false);
    }
  };

  return { run, error, busy };
}
