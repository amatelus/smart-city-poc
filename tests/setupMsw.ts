import { http, passthrough } from 'msw';
import { setupServer, type SetupServerApi } from 'msw/node';
import { setupMswHandlers } from './setupMswHandlers';
import { TEST_BASE_URL, testEnvs } from './utils';

export function setupMsw(): SetupServerApi {
  const server = setupServer(
    http.all(`${testEnvs().S3_ENDPOINT}/*`, passthrough),
    ...setupMswHandlers(),
    ...setupMswHandlers({ baseURL: TEST_BASE_URL }),
  );

  server.listen({ onUnhandledRequest: 'error' });

  return server;
}
