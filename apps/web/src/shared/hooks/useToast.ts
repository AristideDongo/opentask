import { createContext, useContext } from 'react';

export interface Toast {
  notify(message: string): void;
}

export const ToastContext = createContext<Toast>({ notify: () => {} });

export const useToast = () => useContext(ToastContext);
