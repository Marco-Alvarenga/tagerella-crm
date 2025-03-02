// src/server/index.js
const { startServer } = require('./config/server');
require('./config/database');

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});