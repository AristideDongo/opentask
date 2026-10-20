import { type ReactNode, useCallback, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ToastContext, type ToastLink } from '../hooks/useToast';

const TOAST_MS = 4000;
const TOAST_WITH_LINK_MS = 8000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; link?: ToastLink } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const notify = useCallback((message: string, link?: ToastLink) => {
    setToast({ message, link });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), link ? TOAST_WITH_LINK_MS : TOAST_MS);
  }, []);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div
        aria-live="polite"
        role="status"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
      >
        {toast && (
          <p className="pointer-events-auto flex max-w-xl items-center gap-3 rounded-[var(--radius-control)] bg-ink px-4 py-2.5 text-sm font-medium text-bg shadow-lg">
            <span>{toast.message}</span>
            {toast.link && (
              <Link
                to={toast.link.to}
                onClick={() => setToast(null)}
                className="shrink-0 font-semibold underline underline-offset-2"
              >
                {toast.link.label}
              </Link>
            )}
          </p>
        )}
      </div>
    </ToastContext.Provider>
  );
}
