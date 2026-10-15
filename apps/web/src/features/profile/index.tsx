import { useLoaderData } from 'react-router';
import { PageHeader } from '../../shared/components/page-header';
import { Section } from '../../shared/components/section';
import { useI18n } from '../../shared/hooks/useI18n';
import { useSessionData } from '../../shared/hooks/useSessionData';
import { ApiTokenList } from './components/api-token-list';
import { CreateApiTokenForm } from './components/create-api-token-form';
import { ProfileForm } from './components/profile-form';
import { profileAction } from './servers/profile.actions';
import { profileLoader } from './servers/profile.loader';

export const clientLoader = profileLoader;
export const clientAction = profileAction;

export default function ProfilePage() {
  const { tokens } = useLoaderData<typeof profileLoader>();
  const { me } = useSessionData();
  const { t } = useI18n();
  return (
    <>
      <PageHeader title={t('profile.title')} />
      <div className="space-y-6">
        <Section
          title={me.email}
          description={me.emailVerified ? undefined : t('profile.emailUnverified')}
        >
          <ProfileForm me={me} />
        </Section>
        <Section title={t('tokens.title')} description={t('tokens.intro')}>
          <div className="space-y-6">
            <ApiTokenList tokens={tokens} />
            <CreateApiTokenForm />
          </div>
        </Section>
      </div>
    </>
  );
}
