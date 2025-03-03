// src/server/index.js
const { startServer } = require('./config/server');
require('./config/database');
const fs = require('fs');
const path = require('path');
const uploadsDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`Diretório de uploads criado: ${uploadsDir}`);
  } catch (error) {
    console.error(`Erro ao criar diretório de uploads: ${error.message}`);
  }
}

try {
  fs.accessSync(uploadsDir, fs.constants.R_OK | fs.constants.W_OK);
  console.log(`Diretório de uploads tem permissões adequadas: ${uploadsDir}`);
} catch (error) {
  console.error(`Erro de permissões no diretório de uploads: ${error.message}`);
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
