import { ActivityList } from '../../../shared/components/activity-list';
import { Alert } from '../../../shared/components/alert';
import { Button } from '../../../shared/components/button';
import { Section } from '../../../shared/components/section';
import { useI18n } from '../../../shared/hooks/useI18n';
import { useAuditPages } from '../hooks/useAuditPages';
import type { AuditPageVM } from '../workspace-settings.types';

export function AuditLog({ workspaceId, initial }: { workspaceId: string; initial: AuditPageVM }) {
  const { t } = useI18n();
  const { entries, hasMore, loadMore, loading, error } = useAuditPages(workspaceId, initial);
  return (
    <Section title={t('settings.audit')} description={t('settings.auditIntro')}>
      {entries.length === 0 ? (
        <p className="text-muted">{t('settings.auditEmpty')}</p>
      ) : (
        <ActivityList entries={entries} />
      )}
      {error && <Alert tone="error">{error}</Alert>}
      {hasMore && (
        <Button
          variant="secondary"
          size="sm"
          className="mt-3"
          busy={loading}
          onClick={() => void loadMore()}
        >
          {t('settings.auditMore')}
        </Button>
      )}
    </Section>
  );
}
