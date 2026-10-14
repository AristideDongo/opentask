import { type ReactNode, useCallback, useRef, useState } from 'react';
import { ToastContext } from '../hooks/useToast';

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const notify = useCallback((next: string) => {
    setMessage(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div
        aria-live="polite"
        role="status"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
      >
        {message && (
          <p className="pointer-events-auto rounded-[var(--radius-control)] bg-ink px-4 py-2.5 text-sm font-medium text-bg shadow-lg">
            {message}
          </p>
        )}
      </div>
    </ToastContext.Provider>
  );
}
