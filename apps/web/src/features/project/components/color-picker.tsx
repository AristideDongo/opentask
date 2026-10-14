import { LABEL_PALETTE } from '@opentask/contracts/projects/label';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';
import { useId } from 'react';
import { useI18n } from '../../../shared/hooks/useI18n';

export function ColorPicker({ value, onChange }: { value: string; onChange(color: string): void }) {
  const { t } = useI18n();
  const id = useId();
  const custom = !(LABEL_PALETTE as readonly string[]).includes(value);
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-semibold">{t('label.color')}</legend>
      <div className="flex flex-wrap items-center gap-1.5">
        {LABEL_PALETTE.map((color) => (
          <button
            key={color}
            type="button"
            aria-pressed={value === color}
            aria-label={t('label.colorOption', { color })}
            onClick={() => onChange(color)}
            className={clsx(
              'flex size-7 items-center justify-center rounded-full ring-offset-2 ring-offset-surface',
              value === color && 'ring-2 ring-ink',
            )}
            style={{ backgroundColor: color }}
          >
            {value === color && (
              <Check aria-hidden className="size-4 text-white mix-blend-difference" />
            )}
          </button>
        ))}
        <label
          htmlFor={id}
          className={clsx(
            'relative flex h-7 cursor-pointer items-center gap-1.5 rounded-full border border-line px-2 text-xs text-muted hover:bg-sunken',
            custom && 'ring-2 ring-ink ring-offset-2 ring-offset-surface',
          )}
        >
          <span
            className="size-4 rounded-full border border-line"
            style={{ backgroundColor: value }}
          />
          {t('label.customColor')}
          <input
            id={id}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value.toLowerCase())}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>
      </div>
    </fieldset>
  );
}
