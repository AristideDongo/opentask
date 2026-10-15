import { Badge } from '@opentask/ui/components/badge';
import type { FeatureStatus } from '../types/locale.types';

const VARIANTS: Record<FeatureStatus, 'default' | 'secondary' | 'outline'> = {
  available: 'default',
  'in-progress': 'secondary',
  planned: 'outline',
};

export function StatusBadge({ status, label }: { status: FeatureStatus; label: string }) {
  return (
    <Badge variant={VARIANTS[status]} data-status={status}>
      {label}
    </Badge>
  );
}
