import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/akitakata-kagura/',
  plugins: [
    react(),
  ],
  server: {
    proxy: {
      '/google-sheets': {
        target: 'https://docs.google.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/google-sheets/, ''),
        // プロキシ側でリダイレクト（302）を追跡するように設定（ブラウザに返さない）
        followRedirects: true,
      },
    },
  },
});
