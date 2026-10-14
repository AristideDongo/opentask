import { type RouteConfig, index, layout, route } from '@react-router/dev/routes';

export default [
  layout('features/auth/index.tsx', [
    route('login', 'features/login/index.tsx'),
    route('register', 'features/register/index.tsx'),
    route('forgot-password', 'features/forgot-password/index.tsx'),
    route('reset-password', 'features/reset-password/index.tsx'),
  ]),
  route('invite/:token', 'features/invitation/index.tsx'),
  layout('features/app-shell/index.tsx', [
    index('features/home/index.tsx'),
    route('onboarding', 'features/onboarding/index.tsx'),
    route('profile', 'features/profile/index.tsx'),
    route('w/:workspaceId', 'features/workspace/index.tsx', [
      index('features/workspace-overview/index.tsx'),
      route('my-tasks', 'features/my-tasks/index.tsx'),
      route('members', 'features/members/index.tsx'),
      route('settings', 'features/workspace-settings/index.tsx'),
      route('p/:projectId', 'features/project/index.tsx', [
        route('t/:taskId', 'features/task/index.tsx'),
      ]),
      route('c/:channelId', 'features/channel/index.tsx'),
      route('teams/:teamId', 'features/team/index.tsx'),
    ]),
  ]),
  route('*', 'features/not-found/index.tsx'),
] satisfies RouteConfig;
