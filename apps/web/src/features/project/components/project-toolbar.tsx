import { TASK_PRIORITIES } from '@opentask/contracts/tasks/status';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../shared/components/button';
import { Input, Select } from '../../../shared/components/form-controls';
import { useI18n } from '../../../shared/hooks/useI18n';
import { useSessionData } from '../../../shared/hooks/useSessionData';
import { useWorkspaceData } from '../../../shared/hooks/useWorkspaceData';
import type { ProjectVM } from '../../../shared/types/project.types';
import { useProjectFilters } from '../hooks/useProjectFilters';
import { SORT_OPTIONS } from '../project.const';

const selectClass = 'h-9 w-auto text-sm';

export function ProjectToolbar({ project }: { project: ProjectVM }) {
  const { t } = useI18n();
  const { members } = useWorkspaceData();
  const { me } = useSessionData();
  const filters = useProjectFilters();
  const [q, setQ] = useState(filters.get('q'));
  const commitSearch = () => q.trim() !== filters.get('q') && filters.set('q', q.trim());

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3 sm:px-8">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          filters.set('q', q.trim());
        }}
        className="relative w-full sm:w-64"
      >
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted"
        />
        <label htmlFor="task-search" className="sr-only">
          {t('filter.search')}
        </label>
        <Input
          id="task-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onBlur={commitSearch}
          placeholder={t('filter.search')}
          className="h-9 pl-8 text-sm"
        />
      </form>
      {!filters.board && (
        <Select
          aria-label={t('column.label')}
          value={filters.get('columnId')}
          onChange={(e) => filters.set('columnId', e.target.value)}
          className={selectClass}
        >
          <option value="">{t('column.allColumns')}</option>
          {project.columns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      )}
      <Select
        aria-label={t('task.priority')}
        value={filters.get('priority')}
        onChange={(e) => filters.set('priority', e.target.value)}
        className={selectClass}
      >
        <option value="">{t('filter.allPriorities')}</option>
        {TASK_PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {t(`priority.${p}`)}
          </option>
        ))}
      </Select>
      <Select
        aria-label={t('task.assignee')}
        value={filters.get('assigneeId')}
        onChange={(e) => filters.set('assigneeId', e.target.value)}
        className={selectClass}
      >
        <option value="">{t('filter.allAssignees')}</option>
        <option value={me.id}>{t('filter.me')}</option>
        <option value="none">{t('task.unassigned')}</option>
        {members
          .filter((m) => !m.isMe)
          .map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
      </Select>
      {project.labels.length > 0 && (
        <Select
          aria-label={t('task.labels')}
          value={filters.get('labelId')}
          onChange={(e) => filters.set('labelId', e.target.value)}
          className={selectClass}
        >
          <option value="">{t('label.filter')}</option>
          {project.labels.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </Select>
      )}
      {!filters.board && (
        <Select
          aria-label={t('filter.sort')}
          value={filters.get('sort') || 'position'}
          onChange={(e) => filters.set('sort', e.target.value === 'position' ? '' : e.target.value)}
          className={selectClass}
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {t('filter.sort')} : {t(`sort.${s}`)}
            </option>
          ))}
        </Select>
      )}
      {filters.hasActive && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setQ('');
            filters.reset();
          }}
        >
          {t('filter.reset')}
        </Button>
      )}
    </div>
  );
}
