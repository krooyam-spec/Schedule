// Startup file for Plesk Node.js environment
// This file loads and runs the server logic from server.cjs
console.log('Starting SiamSchedule Server via app.js...');

try {
    require('./server.cjs');
} catch (err) {
    console.error('Critical Error during server startup:', err);
    process.exit(1);
}
