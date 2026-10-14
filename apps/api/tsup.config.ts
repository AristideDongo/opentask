import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node24',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  noExternal: [/^@opentask\//],
  external: [
    '@node-rs/argon2',
    'better-auth',
    /^better-auth\//,
    '@prisma/client',
    /^@prisma\//,
    'pg',
  ],
});
