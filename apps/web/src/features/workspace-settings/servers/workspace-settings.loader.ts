import { toAuditPageVM } from '../mappers/audit-page.mapper';
import { fetchFirstAuditPage } from './workspace-settings.service';

export async function workspaceSettingsLoader({ params }: { params: { workspaceId?: string } }) {
  const audit = await fetchFirstAuditPage(params.workspaceId ?? '');
  return { audit: audit ? toAuditPageVM(audit) : null };
}
