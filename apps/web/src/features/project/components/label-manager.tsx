import { LABEL_PALETTE } from '@opentask/contracts/projects/label';
import { Tag } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Alert } from '../../../shared/components/alert';
import { Button } from '../../../shared/components/button';
import { Input } from '../../../shared/components/form-controls';
import { LabelChip } from '../../../shared/components/label-chip';
import { Modal } from '../../../shared/components/modal';
import { useI18n } from '../../../shared/hooks/useI18n';
import { useWorkspaceData } from '../../../shared/hooks/useWorkspaceData';
import type { LabelVM } from '../../../shared/types/project.types';
import { readableTextColor } from '../../../shared/utils/color';
import { useProjectMutation } from '../hooks/useProjectMutation';
import { createLabel } from '../servers/project.service';
import { ColorPicker } from './color-picker';
import { LabelRow } from './label-row';

const paletteColor = (index: number) =>
  LABEL_PALETTE[index % LABEL_PALETTE.length] ?? LABEL_PALETTE[0];

export function LabelManager({ projectId, labels }: { projectId: string; labels: LabelVM[] }) {
  const { workspace } = useWorkspaceData();
  const { t } = useI18n();
  const { run, error, busy } = useProjectMutation();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(paletteColor(labels.length));

  const create = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await run(
      () => createLabel(workspace.id, projectId, { name: name.trim(), color }),
      () => {
        setName('');
        setColor(paletteColor(labels.length + 1));
      },
    );
  };

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      title={t('label.manage')}
      description={t('label.intro')}
      trigger={
        <Button variant="secondary">
          <Tag aria-hidden className="size-4" />
          {t('label.title')}
          {labels.length > 0 && <span className="text-muted">{labels.length}</span>}
        </Button>
      }
    >
      {labels.length === 0 ? (
        <p className="text-sm text-muted">{t('label.none')}</p>
      ) : (
        <ul className="divide-y divide-line">
          {labels.map((l) => (
            <LabelRow key={`${l.id}-${l.name}-${l.color}`} projectId={projectId} label={l} />
          ))}
        </ul>
      )}
      <form
        onSubmit={create}
        className="mt-4 space-y-3 rounded-[var(--radius-panel)] bg-sunken p-4"
      >
        <h3 className="font-semibold">{t('label.new')}</h3>
        <div className="flex items-center gap-2">
          <label htmlFor="label-new" className="sr-only">
            {t('label.name')}
          </label>
          <Input
            id="label-new"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('label.namePlaceholder')}
            maxLength={40}
            className="h-9 flex-1 text-sm"
          />
          <span aria-hidden>
            <LabelChip
              label={{
                name: name.trim() || t('label.preview'),
                color,
                textColor: readableTextColor(color),
              }}
              size="md"
            />
          </span>
        </div>
        <ColorPicker value={color} onChange={setColor} />
        {error && <Alert tone="error">{error}</Alert>}
        <Button type="submit" busy={busy} disabled={!name.trim()}>
          {t('label.create')}
        </Button>
      </form>
    </Modal>
  );
}
