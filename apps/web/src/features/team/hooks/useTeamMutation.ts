import { useState } from 'react';
import { useRevalidator } from 'react-router';
import { useI18n } from '../../../shared/hooks/useI18n';

export function useTeamMutation() {
  const { errorMessage } = useI18n();
  const revalidator = useRevalidator();
  const [error, setError] = useState<string | null>(null);

  const run = async (request: () => Promise<unknown>) => {
    setError(null);
    try {
      await request();
      await revalidator.revalidate();
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  return { run, error };
}
