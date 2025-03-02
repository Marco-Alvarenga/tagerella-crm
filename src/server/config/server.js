// src/server/config/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

// Import routes
const clientRoutes = require('../routes/client.routes');
const terapeutaRoutes = require('../routes/terapeuta.routes');
const promotionRoutes = require('../routes/promotion.routes');
const jogosRoutes = require('../routes/jogos.routes');
const uploadRoutes = require('../routes/upload.routes');
const authRoutes = require('../routes/auth.routes');
const sessionRoutes = require('../routes/session.routes');
const authMiddleware = require('../middleware/auth.middleware');

// Initialize express
const app = express();


// Middleware
app.use(cors({ credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurações de diretórios de upload
const uploadsDir = path.join(__dirname, '../../../uploads');
const imgDir = path.join(__dirname, '../../../src/img');

// Criar diretórios se não existirem
const fs = require('fs');
[uploadsDir, path.join(uploadsDir, 'documentos')].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Servir arquivos estáticos
app.use('/uploads/documentos', express.static(path.join(uploadsDir, 'documentos')));
app.use('/uploads/fotos', express.static(path.join(uploadsDir, 'fotos')));
app.use('/uploads/assinaturas', express.static(path.join(uploadsDir, 'assinaturas')));
app.use('/uploads', express.static(uploadsDir));
//app.use('/uploads', express.static(imgDir));


// API routes
app.use('/api/auth', authRoutes);

// Rotas protegidas por autenticação
app.use('/api/*', authMiddleware);
app.use('/api/upload', uploadRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/terapeutas', terapeutaRoutes);
app.use('/api', promotionRoutes);
app.use('/api/jogos', jogosRoutes);
app.use('/api/sessions', sessionRoutes);

// Servir arquivos estáticos do React
app.use(express.static(path.join(__dirname, '../../../public')));


// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Erro na requisição:', err);
    
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ 
            message: 'Erro no upload do arquivo',
            error: err.message 
        });
    }

    if (err.message && err.message.includes('Boundary not found')) {
        return res.status(400).json({ 
            message: 'Erro no formato do upload',
            error: 'Formato multipart inválido'
        });
    }

    res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: err.message || 'Erro desconhecido'
    });
});

// Rota default para React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../public/index.html'));
});


const PORT = process.env.PORT;

// Start server
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

module.exports = { app, startServer };