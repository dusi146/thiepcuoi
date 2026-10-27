import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5176,
    strictPort: true,
    allowedHosts: true,
    watch: {
      ignored: ['**/*.zip', '**/photo.zip', '**/dist/**', '**/.git/**']
    }
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        nhaplieu: resolve(__dirname, 'nhap-lieu.html')
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('node_modules/gsap')) return 'motion';
        },
      },
    },
  },
});
