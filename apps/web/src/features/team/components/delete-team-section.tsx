import { Button } from '../../../shared/components/button';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog';
import { Section } from '../../../shared/components/section';
import { useI18n } from '../../../shared/hooks/useI18n';
import type { TeamVM } from '../../../shared/types/team.types';

export function DeleteTeamSection({ team, onDelete }: { team: TeamVM; onDelete(): Promise<void> }) {
  const { t } = useI18n();
  return (
    <Section
      title={t('team.delete')}
      tone="danger"
      description={t('team.deleteBody', { name: team.name })}
    >
      <ConfirmDialog
        trigger={<Button variant="danger">{t('team.delete')}</Button>}
        title={t('team.delete')}
        description={t('team.deleteBody', { name: team.name })}
        confirmLabel={t('team.delete')}
        onConfirm={onDelete}
      />
    </Section>
  );
}
