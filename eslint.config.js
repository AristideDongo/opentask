// @ts-check
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

const contractsBarrel = {
  name: '@opentask/contracts',
  message: 'Importez un fichier précis du contrat, par ex. @opentask/contracts/tasks/task.',
};

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.react-router/**',
      '**/generated/**',
      '**/coverage/**',
      '**/test-results/**',
      '**/playwright-report/**',
      '.agents/**',
      'apps/api/src.old/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.node } },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    files: ['packages/contracts/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@nestjs/*', '@prisma/*', 'react', 'react-*'],
              message: 'Les contrats ne dépendent d’aucun framework.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/api/**/*.ts'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
      'no-restricted-imports': ['error', { paths: [contractsBarrel] }],
    },
  },
  {
    files: [
      'apps/api/src/domains/**/*.ts',
      'apps/api/src/infrastructures/**/*.ts',
      'apps/api/src/shared/**/*.ts',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [contractsBarrel],
          patterns: [
            {
              group: ['**/presentations/**'],
              message: 'Les flèches vont toujours vers domains/, jamais vers presentations/.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'no-restricted-imports': ['error', { paths: [contractsBarrel] }],
    },
  },
  {
    files: ['apps/web/src/**/*.{ts,tsx}'],
    ignores: [
      'apps/web/src/**/servers/**',
      'apps/web/src/shared/utils/api-client.ts',
      'apps/web/src/shared/utils/event-stream.ts',
    ],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message: 'Aucun fetch hors de features/*/servers : passez par un *.service.ts.',
        },
        {
          name: 'EventSource',
          message: 'Le flux temps réel passe par shared/utils/event-stream.ts.',
        },
      ],
    },
  },
);
