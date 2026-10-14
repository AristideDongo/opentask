import { clsx } from 'clsx';
import { Columns3, List } from 'lucide-react';
import { useI18n } from '../../../shared/hooks/useI18n';
import type { ProjectView } from '../project.types';

const VIEWS: { view: ProjectView; Icon: typeof List }[] = [
  { view: 'list', Icon: List },
  { view: 'board', Icon: Columns3 },
];

export function ViewTabs({
  label,
  board,
  onChange,
}: {
  label: string;
  board: boolean;
  onChange(view: ProjectView): void;
}) {
  const { t } = useI18n();
  return (
    <div className="mt-4 flex items-end gap-1" role="tablist" aria-label={label}>
      {VIEWS.map(({ view, Icon }) => {
        const active = (view === 'board') === board;
        return (
          <button
            key={view}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(view)}
            className={clsx(
              '-mb-px inline-flex h-10 items-center gap-2 border-b-2 px-3 text-[0.9375rem] font-semibold',
              active ? 'border-accent text-ink' : 'border-transparent text-muted hover:text-ink',
            )}
          >
            <Icon aria-hidden className="size-4" />
            {t(`project.view.${view}`)}
          </button>
        );
      })}
    </div>
  );
}
