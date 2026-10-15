import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/stdio.ts', 'src/http.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node24',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  noExternal: [/^@opentask\//],
  banner: { js: '#!/usr/bin/env node' },
});
