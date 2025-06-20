import { render } from '@testing-library/react';
import { SWRConfig } from 'swr';

export const TEST_BASE_URL = 'http://localhost:3000';

export const TEST_SIGN_IN_NAME_PREFIX = 'test-username-prefix';

const TEST_ENV_NAMES = ['S3_ENDPOINT', 'S3_BUCKET'] as const;

type TestEnvs = Record<(typeof TEST_ENV_NAMES)[number], string | undefined>;

export function testEnvs(): TestEnvs {
  return TEST_ENV_NAMES.reduce(
    (dict, name) => ({ ...dict, [name]: process.env[name] }),
    {} as TestEnvs,
  );
}

export function renderWithSWR(ui: React.ReactNode): ReturnType<typeof render> {
  return render(<SWRConfig value={{ provider: () => new Map() }}>{ui}</SWRConfig>);
}
