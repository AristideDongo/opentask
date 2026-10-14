import { useState } from 'react';
import { Button } from '../../../shared/components/button';
import { useI18n } from '../../../shared/hooks/useI18n';
import type { TaskDetailVM } from '../../../shared/types/task.types';
import { TEXTAREA_CLASS } from '../task.const';

export function DescriptionField({
  task,
  disabled,
  onSave,
}: {
  task: TaskDetailVM;
  disabled: boolean;
  onSave(description: string): Promise<void>;
}) {
  const { t } = useI18n();
  const [value, setValue] = useState(task.description);
  const [busy, setBusy] = useState(false);
  const dirty = value !== task.description;
  return (
    <section>
      <label htmlFor="task-description" className="mb-1.5 block text-sm font-semibold">
        {t('task.description')}
      </label>
      <textarea
        id="task-description"
        value={value}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
        rows={5}
        placeholder={disabled ? '' : t('task.descriptionPlaceholder')}
        className={TEXTAREA_CLASS}
      />
      {dirty && (
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setValue(task.description)}>
            {t('common.cancel')}
          </Button>
          <Button
            size="sm"
            busy={busy}
            onClick={async () => {
              setBusy(true);
              await onSave(value);
              setBusy(false);
            }}
          >
            {t('common.save')}
          </Button>
        </div>
      )}
    </section>
  );
}
