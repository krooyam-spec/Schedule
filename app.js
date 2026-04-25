// Startup file for Plesk Node.js environment
// This file loads and runs the server logic from server.cjs

import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting SiamSchedule Server...');

// Just run the server.cjs using node
import('./server.cjs').catch(err => {
    // If dynamic import fails, fallback to spawning node
    exec(`node ${path.join(__dirname, 'server.cjs')}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });
});
