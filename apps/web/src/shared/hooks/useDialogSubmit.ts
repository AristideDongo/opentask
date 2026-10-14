import { useState } from 'react';
import { useI18n } from './useI18n';

export function useDialogSubmit<T>() {
  const { errorMessage } = useI18n();
  const [open, setOpenState] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setOpen = (value: boolean) => {
    setOpenState(value);
    setError(null);
  };

  const submit = async (request: () => Promise<T>, onSuccess: (result: T) => void) => {
    setError(null);
    try {
      const result = await request();
      setOpenState(false);
      onSuccess(result);
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  return { open, setOpen, error, submit };
}
