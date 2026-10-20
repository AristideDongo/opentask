import { clsx } from 'clsx';
import {
  type KeyboardEvent,
  type TextareaHTMLAttributes,
  forwardRef,
  useId,
  useMemo,
  useState,
} from 'react';
import { useI18n } from '../hooks/useI18n';
import type { MentionRefVM } from '../types/content.types';
import { Avatar } from './avatar';

const QUERY = /(^|\s)@([^\s@]{0,30})$/;
const MAX_SUGGESTIONS = 6;

interface Candidate extends MentionRefVM {
  initials: string;
}

const fold = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

type Props = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> & {
  value: string;
  onValueChange(value: string): void;
  candidates: Candidate[];
  picked: MentionRefVM[];
  onPickedChange(picked: MentionRefVM[]): void;
};

export const MentionTextarea = forwardRef<HTMLTextAreaElement, Props>(function MentionTextarea(
  { value, onValueChange, candidates, picked, onPickedChange, onKeyDown, className, ...rest },
  ref,
) {
  const { t } = useI18n();
  const listId = useId();
  const [caret, setCaret] = useState(0);
  const [active, setActive] = useState(0);
  const [dismissed, setDismissed] = useState<string | null>(null);

  const query = QUERY.exec(value.slice(0, caret))?.[2];
  const suggestions = useMemo(
    () =>
      query === undefined
        ? []
        : candidates.filter((c) => fold(c.name).includes(fold(query))).slice(0, MAX_SUGGESTIONS),
    [candidates, query],
  );
  const open = query !== undefined && query !== dismissed && suggestions.length > 0;

  const choose = (candidate: Candidate) => {
    const before = value
      .slice(0, caret)
      .replace(QUERY, (_all, space: string) => `${space}@${candidate.name} `);
    const next = before + value.slice(caret);
    onValueChange(next);
    if (!picked.some((p) => p.id === candidate.id))
      onPickedChange([...picked, { id: candidate.id, name: candidate.name }]);
    setCaret(before.length);
    setActive(0);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (open) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const delta = event.key === 'ArrowDown' ? 1 : -1;
        setActive((current) => (current + delta + suggestions.length) % suggestions.length);
        return;
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        const candidate = suggestions[active];
        if (candidate) choose(candidate);
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        setDismissed(query ?? null);
        return;
      }
    }
    onKeyDown?.(event);
  };

  return (
    <div className="relative flex-1">
      <textarea
        {...rest}
        ref={ref}
        value={value}
        role="combobox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        onChange={(event) => {
          onValueChange(event.target.value);
          setCaret(event.target.selectionStart);
          setDismissed(null);
          setActive(0);
        }}
        onSelect={(event) => setCaret(event.currentTarget.selectionStart)}
        onKeyDown={handleKeyDown}
        className={className}
      />
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={t('mention.suggestions')}
          className="absolute bottom-full left-0 z-30 mb-1 w-72 overflow-hidden rounded-[var(--radius-panel)] border border-line bg-surface py-1 shadow-xl"
        >
          {suggestions.map((candidate, index) => (
            <li
              key={candidate.id}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              onMouseDown={(event) => {
                event.preventDefault();
                choose(candidate);
              }}
              onMouseEnter={() => setActive(index)}
              className={clsx(
                'flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm',
                index === active && 'bg-accent-soft',
              )}
            >
              <Avatar initials={candidate.initials} size="sm" />
              {candidate.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
