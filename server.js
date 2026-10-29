// Root entrypoint forwarding to backend/server.js
// Enables cloud platforms (Render, Heroku) using 'node server.js' to start smoothly
require('./backend/server.js');
