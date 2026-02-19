import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api/seoul': {
            target: 'http://openapi.seoul.go.kr:8088',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/seoul/, ''),
          },
          '/api/claude': {
            target: 'https://api.anthropic.com',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/claude/, ''),
          },
        },
      },
      plugins: [react()],
      esbuild: {
        drop: mode === 'production' ? ['debugger'] : [],
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
