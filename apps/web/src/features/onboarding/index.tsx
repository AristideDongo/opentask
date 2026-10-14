import { useActionData } from 'react-router';
import { Alert } from '../../shared/components/alert';
import { PageHeader } from '../../shared/components/page-header';
import { useI18n } from '../../shared/hooks/useI18n';
import { useSessionData } from '../../shared/hooks/useSessionData';
import { OnboardingForm } from './components/onboarding-form';
import { onboardingAction } from './servers/onboarding.actions';

export const clientAction = onboardingAction;

export default function OnboardingPage() {
  const { t, errorMessage } = useI18n();
  const { workspaces } = useSessionData();
  const result = useActionData<typeof onboardingAction>();
  return (
    <div className="max-w-lg">
      <PageHeader
        title={workspaces.length === 0 ? t('onboarding.title') : t('onboarding.newTitle')}
      >
        {t('onboarding.intro')}
      </PageHeader>
      {result && !result.ok && (
        <div className="mb-4">
          <Alert tone="error">{errorMessage(result.error)}</Alert>
        </div>
      )}
      <OnboardingForm />
    </div>
  );
}
