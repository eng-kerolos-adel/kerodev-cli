// src/generators/web/configs/vite.ts

import type { WebProjectConfig } from '../../../types/index.js';
import { TAILWIND_VITE_FRAMEWORKS } from '../../../constants/index.js';

export function generateViteConfig(config: WebProjectConfig): string {
  const withTailwind = config.css === 'tailwind' && TAILWIND_VITE_FRAMEWORKS.includes(config.framework);

  return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
${withTailwind ? "import tailwindcss from '@tailwindcss/vite';" : ''}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),${withTailwind ? '\n    tailwindcss(),' : ''}
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
});
`;
}
