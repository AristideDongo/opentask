import { Plus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useRevalidator } from 'react-router';
import { Alert } from '../../../shared/components/alert';
import { Button } from '../../../shared/components/button';
import { Input } from '../../../shared/components/form-controls';
import { useI18n } from '../../../shared/hooks/useI18n';
import { useWorkspaceData } from '../../../shared/hooks/useWorkspaceData';
import { createTask } from '../../../shared/servers/task.service';

export function QuickAdd({ projectId }: { projectId: string }) {
  const { workspace } = useWorkspaceData();
  const { t, errorMessage } = useI18n();
  const revalidator = useRevalidator();
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await createTask(workspace.id, projectId, { title: title.trim() });
      setTitle('');
      await revalidator.revalidate();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mb-5 max-w-2xl">
      <div className="flex gap-2">
        <label htmlFor="quick-add" className="sr-only">
          {t('task.new')}
        </label>
        <Input
          id="quick-add"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('task.newPlaceholder')}
          maxLength={200}
          className="h-10"
        />
        <Button type="submit" busy={busy} variant="secondary">
          <Plus aria-hidden className="size-4" />
          {t('task.add')}
        </Button>
      </div>
      {error && (
        <div className="mt-2">
          <Alert tone="error">{error}</Alert>
        </div>
      )}
    </form>
  );
}
