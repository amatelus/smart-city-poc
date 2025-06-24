import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';
import type { InlineConfig } from 'vitest/node';

const includeFile = process.argv[4] as string | undefined;
const testBase: InlineConfig = {
  environment: 'jsdom',
  setupFiles: ['tests/setup.ts'],
  testTimeout: 10000,
};
const coverageBase = {
  include: ['src/**/*.{ts,tsx}', 'server/**/*.ts'],
  exclude: [
    'server/lib/prismaClient.ts',
    'src/app/layout.tsx',
    'src/utils/apiClient.ts',
    'src/**/*.module.css.d.ts',
    'src/utils/condition.ts',
    'src/utils/$path.ts',
    'src/**/frourio.{client,server}.ts',
  ],
};

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test:
    includeFile === undefined
      ? {
          ...testBase,
          coverage: {
            ...coverageBase,
            // thresholds: { statements: 10, branches: 10, functions: 10, lines: 10 },
          },
        }
      : { ...testBase, coverage: coverageBase, include: [includeFile] },
});
