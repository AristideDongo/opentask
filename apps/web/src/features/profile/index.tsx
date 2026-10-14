import { PageHeader } from '../../shared/components/page-header';
import { Section } from '../../shared/components/section';
import { useI18n } from '../../shared/hooks/useI18n';
import { useSessionData } from '../../shared/hooks/useSessionData';
import { ProfileForm } from './components/profile-form';
import { profileAction } from './servers/profile.actions';

export const clientAction = profileAction;

export default function ProfilePage() {
  const { me } = useSessionData();
  const { t } = useI18n();
  return (
    <>
      <PageHeader title={t('profile.title')} />
      <Section
        title={me.email}
        description={me.emailVerified ? undefined : t('profile.emailUnverified')}
      >
        <ProfileForm me={me} />
      </Section>
    </>
  );
}
