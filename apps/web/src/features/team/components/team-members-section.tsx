import { useState } from 'react';
import { Avatar } from '../../../shared/components/avatar';
import { Button } from '../../../shared/components/button';
import { Field, Select } from '../../../shared/components/form-controls';
import { Section } from '../../../shared/components/section';
import { useI18n } from '../../../shared/hooks/useI18n';
import type { MemberVM } from '../../../shared/types/workspace.types';
import type { TeamMemberRowVM } from '../team.types';

export function TeamMembersSection({
  rows,
  candidates,
  manage,
  onAdd,
  onRemove,
}: {
  rows: TeamMemberRowVM[];
  candidates: MemberVM[];
  manage: boolean;
  onAdd(userId: string): Promise<void>;
  onRemove(userId: string): void;
}) {
  const { t } = useI18n();
  const [toAdd, setToAdd] = useState('');
  return (
    <Section title={`${t('team.members')} (${rows.length})`}>
      {rows.length === 0 ? (
        <p className="text-muted">{t('team.noMembers')}</p>
      ) : (
        <ul className="divide-y divide-line">
          {rows.map((m) => (
            <li key={m.id} className="flex items-center gap-3 py-2.5">
              <Avatar initials={m.initials} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{m.name}</p>
                <p className="truncate text-sm text-muted">{m.email}</p>
              </div>
              {manage && (
                <Button variant="ghost" size="sm" onClick={() => onRemove(m.id)}>
                  {t('team.remove')}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      {manage && candidates.length > 0 && (
        <form
          className="mt-4 flex max-w-md items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (toAdd) void onAdd(toAdd).then(() => setToAdd(''));
          }}
        >
          <div className="flex-1">
            <Field label={t('team.addMember')}>
              {(p) => (
                <Select {...p} value={toAdd} onChange={(e) => setToAdd(e.target.value)}>
                  <option value="">{t('channel.choosePerson')}</option>
                  {candidates.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
          <Button type="submit" disabled={!toAdd}>
            {t('task.add')}
          </Button>
        </form>
      )}
    </Section>
  );
}
