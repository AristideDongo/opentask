import { useState } from 'react';
import { useRevalidator } from 'react-router';
import { Button } from '../../../shared/components/button';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog';
import { Field, Select } from '../../../shared/components/form-controls';
import { Section } from '../../../shared/components/section';
import { useI18n } from '../../../shared/hooks/useI18n';
import { useToast } from '../../../shared/hooks/useToast';
import type { MemberVM } from '../../../shared/types/workspace.types';
import { transferOwnership } from '../servers/workspace-settings.service';

export function TransferOwnership({
  workspaceId,
  members,
}: {
  workspaceId: string;
  members: MemberVM[];
}) {
  const { t } = useI18n();
  const { notify } = useToast();
  const revalidator = useRevalidator();
  const candidates = members.filter((m) => m.role === 'admin' || m.role === 'member');
  const [target, setTarget] = useState(candidates[0]?.id ?? '');
  const targetName = candidates.find((m) => m.id === target)?.name ?? '';

  return (
    <Section title={t('settings.transfer.title')} description={t('settings.transfer.body')}>
      {candidates.length === 0 ? (
        <p className="text-sm text-muted">{t('settings.transfer.none')}</p>
      ) : (
        <div className="flex max-w-xl flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Field label={t('settings.transfer.to')}>
              {(p) => (
                <Select {...p} value={target} onChange={(e) => setTarget(e.target.value)}>
                  {candidates.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({t(`role.${m.role}`)})
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
          <ConfirmDialog
            trigger={<Button variant="secondary">{t('settings.transfer.submit')}</Button>}
            title={t('settings.transfer.confirm', { name: targetName })}
            description={t('settings.transfer.body')}
            confirmLabel={t('settings.transfer.submit')}
            tone="primary"
            onConfirm={async () => {
              await transferOwnership(workspaceId, target);
              await revalidator.revalidate();
              notify(t('settings.transfer.done', { name: targetName }));
            }}
          />
        </div>
      )}
    </Section>
  );
}
