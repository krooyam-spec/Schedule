// Entry point for IIS/iisnode
console.log('Initializing SiamSchedule via server.js...');

// Load the compiled server logic
try {
    require('./server.cjs');
} catch (err) {
    console.error('Fatal failure during server startup:', err);
    // In IIS, it's better to log the full stack trace
    console.error(err.stack);
    process.exit(1);
}
