import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Alert } from '../../../shared/components/alert';
import { Button } from '../../../shared/components/button';
import { Input } from '../../../shared/components/form-controls';
import { LabelChip } from '../../../shared/components/label-chip';
import { useI18n } from '../../../shared/hooks/useI18n';
import { useWorkspaceData } from '../../../shared/hooks/useWorkspaceData';
import type { LabelVM } from '../../../shared/types/project.types';
import { readableTextColor } from '../../../shared/utils/color';
import { useProjectMutation } from '../hooks/useProjectMutation';
import { deleteLabel, updateLabel } from '../servers/project.service';
import { ColorPicker } from './color-picker';

export function LabelRow({ projectId, label }: { projectId: string; label: LabelVM }) {
  const { workspace } = useWorkspaceData();
  const { t } = useI18n();
  const { run, error } = useProjectMutation();
  const [name, setName] = useState(label.name);
  const [color, setColor] = useState(label.color);
  const [editingColor, setEditingColor] = useState(false);
  const dirty = name.trim() !== label.name || color !== label.color;

  return (
    <li className="space-y-3 py-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-expanded={editingColor}
          aria-label={`${t('label.color')} : ${label.name}`}
          onClick={() => setEditingColor((v) => !v)}
          className="size-7 shrink-0 rounded-full border border-line"
          style={{ backgroundColor: color }}
        />
        <label className="sr-only" htmlFor={`label-${label.id}`}>
          {t('label.name')}
        </label>
        <Input
          id={`label-${label.id}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          className="h-9 flex-1 text-sm"
        />
        <LabelChip
          label={{ name: name || label.name, color, textColor: readableTextColor(color) }}
          size="md"
        />
        <Button
          variant="ghost"
          size="sm"
          aria-label={t('label.delete', { name: label.name })}
          onClick={() =>
            window.confirm(t('label.deleteConfirm', { name: label.name })) &&
            void run(() => deleteLabel(workspace.id, projectId, label.id))
          }
        >
          <Trash2 aria-hidden className="size-4" />
        </Button>
      </div>
      {editingColor && <ColorPicker value={color} onChange={setColor} />}
      {error && <Alert tone="error">{error}</Alert>}
      {dirty && (
        <Button
          size="sm"
          onClick={() =>
            run(() => updateLabel(workspace.id, projectId, label.id, { name: name.trim(), color }))
          }
        >
          {t('label.save')}
        </Button>
      )}
    </li>
  );
}
