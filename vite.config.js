import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  // บังคับให้ทำงานเฉพาะในโฟลเดอร์นี้เท่านั้น
  root: process.cwd(),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // เพิ่มการตั้งค่าเพื่อหยุด esbuild จากการปีนออกไปหน้าบ้าน
    rollupOptions: {
      input: path.resolve(process.cwd(), 'index.html'),
    }
  },
  optimizeDeps: {
    // ปิดการสแกนหา package.json นอกโฟลเดอร์
    force: true,
  }
});
