import { createContext, useContext } from 'react';

export interface ToastLink {
  to: string;
  label: string;
}

export interface Toast {
  notify(message: string, link?: ToastLink): void;
}

export const ToastContext = createContext<Toast>({ notify: () => {} });

export const useToast = () => useContext(ToastContext);
