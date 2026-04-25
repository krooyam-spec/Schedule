// Startup file for Plesk Node.js environment
// This file loads and runs the server logic from server.ts using tsx (TypeScript Execute)

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting SiamSchedule Server...');

// Using tsx to run the TypeScript server file directly
// This avoids complex build steps for the server file in the Plesk environment
const child = spawn('npx', ['tsx', path.join(__dirname, 'server.ts')], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NODE_ENV: 'production' }
});

child.on('error', (err) => {
  console.error('Failed to start server:', err);
});

child.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
});
