import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  // ใช้เส้นทางแบบแน่นอน (Absolute path) เพื่อป้องกันการสแกนหาไฟล์ผิดที่
  const root = process.cwd();
  const env = loadEnv(mode, root, '');

  return {
    // ระบุ root ให้ชัดเจนว่าเอาแค่ที่นี่
    root: root,
    base: './',
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(root, 'src'),
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      // ป้องกัน esbuild ไม่ให้พยายามไปอ่านข้างนอก
      commonjsOptions: {
        include: [/node_modules/],
      },
    },
    // สั่งให้ Vite สนใจเฉพาะไฟล์ในโปรเจกต์เท่านั้น
    server: {
      fs: {
        strict: true,
        allow: [root]
      }
    }
  };
});
