// Startup file for Plesk Node.js environment
// This file loads and runs the server logic from server.cjs

const { spawn } = require('child_process');
const path = require('path');

console.log('Starting SiamSchedule Server...');

const serverPath = path.resolve(__dirname, 'server.cjs');

const child = spawn('node', [serverPath], {
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
