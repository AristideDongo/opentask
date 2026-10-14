import type { UpdateTeamInput } from '@opentask/contracts/teams/team';
import { useState } from 'react';
import { Button } from '../../../shared/components/button';
import { Field, Input } from '../../../shared/components/form-controls';
import { Section } from '../../../shared/components/section';
import { useI18n } from '../../../shared/hooks/useI18n';
import type { TeamVM } from '../../../shared/types/team.types';

export function EditTeamForm({
  team,
  onSave,
}: {
  team: TeamVM;
  onSave(input: UpdateTeamInput): void;
}) {
  const { t } = useI18n();
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description);
  const dirty = name !== team.name || description !== team.description;
  return (
    <Section title={t('settings.general')}>
      <form
        className="grid max-w-2xl gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          onSave({ name, description });
        }}
      >
        <Field label={t('team.name')}>
          {(p) => <Input {...p} value={name} onChange={(e) => setName(e.target.value)} />}
        </Field>
        <Field label={t('team.description')}>
          {(p) => (
            <Input {...p} value={description} onChange={(e) => setDescription(e.target.value)} />
          )}
        </Field>
        <div>
          <Button type="submit" disabled={!dirty || !name.trim()}>
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Section>
  );
}
