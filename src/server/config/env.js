// src/server/config/env.js
require('dotenv').config();

const env = {
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
    // JWT
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '8h'
    },
    // URLs
    api: {
        url: process.env.API_URL || '/api',
        uploadsUrl: process.env.UPLOADS_URL || '/uploads'
    },
    // Upload
    upload: {
        maxSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880,
        allowedTypes: (process.env.ALLOWED_FILE_TYPES || '').split(',')
    },
    // CORS
    cors: {
        origin: process.env.CORS_ORIGIN
    },	
    // VITE API URL
    vite_url: {
        origin: process.env.VITE_API_URL
    },
    // VITE PORT
    vite_port: {
        origin: process.env.VITE_PORT
    },	
    DB_CONFIG: {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT
    }
};

// Validação das variáveis obrigatórias
const requiredVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'JWT_SECRET'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    throw new Error(`Variáveis de ambiente obrigatórias não definidas: ${missingVars.join(', ')}`);
}

module.exports = env;