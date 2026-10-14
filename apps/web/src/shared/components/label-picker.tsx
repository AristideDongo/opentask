import { useId } from 'react';
import { useI18n } from '../hooks/useI18n';
import type { LabelVM } from '../types/project.types';
import { LabelChip } from './label-chip';

export function LabelPicker({
  labels,
  value,
  onChange,
  disabled = false,
}: {
  labels: LabelVM[];
  value: string[];
  onChange(ids: string[]): void;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  const id = useId();
  if (labels.length === 0) return <p className="text-sm text-muted">{t('label.createHint')}</p>;
  return (
    <fieldset disabled={disabled}>
      <legend className="sr-only">{t('label.edit')}</legend>
      <div className="flex flex-wrap gap-1.5">
        {labels.map((label) => {
          const checked = value.includes(label.id);
          return (
            <label
              key={label.id}
              htmlFor={`${id}-${label.id}`}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line py-0.5 pr-1 pl-2 has-[:checked]:border-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--focus)]"
            >
              <input
                id={`${id}-${label.id}`}
                type="checkbox"
                checked={checked}
                onChange={() =>
                  onChange(checked ? value.filter((v) => v !== label.id) : [...value, label.id])
                }
                className="size-3.5 accent-[var(--accent)]"
              />
              <LabelChip label={label} />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
