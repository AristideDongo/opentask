import { Plus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Button } from '../../../shared/components/button';
import { Input } from '../../../shared/components/form-controls';
import { useI18n } from '../../../shared/hooks/useI18n';
import { useColumnActions } from '../hooks/useColumnActions';

export function AddColumn({ projectId }: { projectId: string }) {
  const { t } = useI18n();
  const actions = useColumnActions(projectId);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (await actions.create(name.trim())) {
      setName('');
      setOpen(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 w-[17rem] shrink-0 items-center gap-2 rounded-[var(--radius-panel)] border border-dashed border-line px-3 text-sm font-semibold text-muted hover:bg-sunken hover:text-ink"
      >
        <Plus aria-hidden className="size-4" />
        {t('column.add')}
      </button>
    );
  }
  return (
    <form
      onSubmit={submit}
      className="w-[17rem] shrink-0 space-y-2 rounded-[var(--radius-panel)] bg-sunken p-2"
    >
      <label htmlFor="new-column" className="sr-only">
        {t('column.name')}
      </label>
      <Input
        id="new-column"
        value={name}
        autoFocus
        maxLength={40}
        placeholder={t('column.namePlaceholder')}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        className="h-9 text-sm"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={!name.trim()}>
          {t('column.add')}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  );
}
