const { exec } = require('child_process');

// Start the server (backend)
const server = exec('npm start', { cwd: './server' });
server.stdout.on('data', (data) => console.log(`Server: ${data}`));
server.stderr.on('data', (data) => console.error(`Server error: ${data}`));

// Start the client (frontend)
const client = exec('npm start', { cwd: './client' });
client.stdout.on('data', (data) => console.log(`Client: ${data}`));
client.stderr.on('data', (data) => console.error(`Client error: ${data}`));
