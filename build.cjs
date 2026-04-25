const { build } = require('vite');
const react = require('@vitejs/plugin-react');
const path = require('path');

async function runBuild() {
  try {
    console.log('Starting strictly isolated build process...');
    
    await build({
      // Pass config inline to avoid Vite's file-based config lookup
      root: __dirname,
      base: './',
      configFile: false, 
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, 'src'),
        },
      },
      build: {
        outDir: 'dist',
        emptyOutDir: true,
        assetsDir: 'assets',
        rollupOptions: {
          input: path.resolve(__dirname, 'index.html'),
        },
      }
    });

    console.log('Build completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

runBuild();
