const { spawn } = require('child_process');
const path = require('path');

// Simple development server without nodemon
const server = spawn('npx', ['ts-node', 'server.ts'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

server.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});