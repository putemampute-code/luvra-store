import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      sourcemap: false
    },
    server: {
      host: true,
      port: 5173,
      proxy: {
        '/api/cj': {
          target: 'https://developers.cjdropshipping.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/cj/, '/api2.0/v1'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const token = env.VITE_CJ_API_KEY || '';
              proxyReq.setHeader('CJ-Access-Token', token);
            });
          }
        }
      }
    }
  }
})
