import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  // บังคับให้ Vite ทำงานเฉพาะในโฟลเดอร์โปรเจกต์เท่านั้น
  root: './',
  base: './',
  // ป้องกันการพยายามเข้าถึง cache นอกโฟลเดอร์
  cacheDir: 'node_modules/.vite',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    // ไม่สแกนหาความสัมพันธ์ของไฟล์นอกเหนือจากจุดนี้
    rollupOptions: {
      external: [],
    },
  },
});
