import { useState } from 'react';
import { Alert } from '../../../shared/components/alert';
import { Button } from '../../../shared/components/button';
import { Field, Select } from '../../../shared/components/form-controls';
import { Modal } from '../../../shared/components/modal';
import { useI18n } from '../../../shared/hooks/useI18n';
import type { ColumnVM } from '../../../shared/types/project.types';

export function DeleteColumnDialog({
  column,
  count,
  columns,
  onDelete,
  onClose,
}: {
  column: ColumnVM;
  count: number;
  columns: ColumnVM[];
  onDelete(moveTasksTo: string | null): Promise<boolean>;
  onClose(): void;
}) {
  const { t } = useI18n();
  const others = columns.filter((c) => c.id !== column.id);
  const [target, setTarget] = useState(others[0]?.id ?? '');
  const [busy, setBusy] = useState(false);

  return (
    <Modal
      open
      onOpenChange={(open) => !open && onClose()}
      title={t('column.deleteTitle', { name: column.name })}
    >
      <div className="space-y-4">
        {others.length === 0 ? (
          <Alert tone="error">{t('column.lastColumn')}</Alert>
        ) : (
          <>
            <p className="text-sm text-muted">{t('column.deleteBody')}</p>
            {count > 0 && (
              <Field label={t('column.deleteMove', { count })}>
                {(p) => (
                  <Select {...p} value={target} onChange={(e) => setTarget(e.target.value)}>
                    {others.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            )}
          </>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="danger"
            busy={busy}
            disabled={others.length === 0}
            onClick={async () => {
              setBusy(true);
              if (await onDelete(count > 0 ? target : null)) onClose();
              setBusy(false);
            }}
          >
            {t('column.delete')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
