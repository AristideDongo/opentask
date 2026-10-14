import * as Dialog from '@radix-ui/react-dialog';
import { useState, type ReactNode } from 'react';
import { useI18n } from '../hooks/useI18n';
import { Alert } from './alert';
import { Button } from './button';

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  onConfirm,
  canConfirm = true,
  children,
  tone = 'danger',
}: {
  trigger: ReactNode;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
  canConfirm?: boolean;
  children?: ReactNode;
  tone?: 'danger' | 'primary';
}) {
  const { t, errorMessage } = useI18n();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-panel)] border border-line bg-surface p-6 shadow-xl">
          <Dialog.Title className="text-lg font-bold">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted">{description}</Dialog.Description>
          {children && <div className="mt-4">{children}</div>}
          {error && (
            <div className="mt-4">
              <Alert tone="error">{error}</Alert>
            </div>
          )}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Dialog.Close asChild>
              <Button variant="secondary">{t('common.cancel')}</Button>
            </Dialog.Close>
            <Button
              variant={tone}
              busy={busy}
              disabled={!canConfirm}
              onClick={async () => {
                setBusy(true);
                setError(null);
                try {
                  await onConfirm();
                  setOpen(false);
                } catch (e) {
                  setError(errorMessage(e));
                } finally {
                  setBusy(false);
                }
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
