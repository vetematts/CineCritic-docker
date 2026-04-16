import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Cloud Run uses a service URL host. Allow it when running Vite in a container.
    // This repo uses Vite's server in the frontend container, so host checks must permit
    // the Cloud Run domain.
    allowedHosts: 'all',
    host: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setupTests.js',
  },
});
