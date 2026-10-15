import { useRevalidator } from 'react-router';
import { Button } from '../../../shared/components/button';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog';
import { useI18n } from '../../../shared/hooks/useI18n';
import { useToast } from '../../../shared/hooks/useToast';
import type { ApiTokenVM } from '../profile.types';
import { revokeApiToken } from '../servers/profile.service';

export function ApiTokenList({ tokens }: { tokens: ApiTokenVM[] }) {
  const { t, formatDate } = useI18n();
  const { notify } = useToast();
  const revalidator = useRevalidator();
  const day = (iso: string) => formatDate(iso, { dateStyle: 'medium' });

  if (tokens.length === 0) return <p className="text-sm text-muted">{t('tokens.empty')}</p>;
  return (
    <ul className="divide-y divide-line">
      {tokens.map((token) => (
        <li key={token.id} className="flex flex-wrap items-center gap-3 py-3">
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{token.name}</p>
            <p className="text-sm text-muted">
              <code>{token.hint}</code> · {token.scopes.join(', ')} ·{' '}
              {token.lastUsedAt
                ? t('tokens.lastUsed', { date: day(token.lastUsedAt) })
                : t('tokens.neverUsed')}{' '}
              ·{' '}
              {token.isExpired
                ? t('tokens.expired')
                : t('tokens.expires', { date: day(token.expiresAt) })}
            </p>
          </div>
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="sm">
                {t('tokens.revoke')}
              </Button>
            }
            title={t('tokens.revokeTitle', { name: token.name })}
            description={t('tokens.revokeBody')}
            confirmLabel={t('tokens.revoke')}
            onConfirm={async () => {
              await revokeApiToken(token.id);
              await revalidator.revalidate();
              notify(t('tokens.revoked'));
            }}
          />
        </li>
      ))}
    </ul>
  );
}
