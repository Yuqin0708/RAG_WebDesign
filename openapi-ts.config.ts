import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'openapi.json',
  output: { path: 'src/client' },
  plugins: [
    { name: '@hey-api/client-axios', throwOnError: true },
    {
      asClass: true,
      name: '@hey-api/sdk',
    },
    {
      name: '@hey-api/typescript',
    }
  ],
});
