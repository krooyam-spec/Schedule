const { build } = require('vite');
const path = require('path');

async function runBuild() {
  try {
    console.log('Starting build process...');
    await build({
      configFile: path.resolve(__dirname, 'vite.config.js'),
      root: __dirname,
      build: {
        outDir: 'dist',
        emptyOutDir: true,
      }
    });
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

runBuild();
