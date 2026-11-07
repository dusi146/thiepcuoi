import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
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
        wedding: resolve(__dirname, 'src/wedding.js'),
        nhaplieu: resolve(__dirname, 'nhap-lieu.html')
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('node_modules/gsap')) return 'motion';
        },
      },
    },
  },
});
