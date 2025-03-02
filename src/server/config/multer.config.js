// src/server/config/multer.config.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração base do multer que pode ser reutilizada
const createMulterConfig = (subdir) => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            let uploadDir;
            if (subdir === 'documentos') {
                uploadDir = path.join(__dirname, '../../../uploads/documentos', req.params.terapeuta_info_id || '');
            } else if (subdir === 'jogos') {
                uploadDir = path.join(__dirname, '../../../uploads/jogos', req.params.jogo_id || '');
            } else {
                uploadDir = path.join(__dirname, '../../../uploads', subdir);
            }
            
            fs.mkdirSync(uploadDir, { recursive: true });
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        }
    });

    const fileFilter = (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.mimetype)) {
            cb(new Error('Tipo de arquivo não permitido'), false);
            return;
        }
        cb(null, true);
    };

    return multer({
        storage,
        fileFilter,
        limits: {
            fileSize: 5 * 1024 * 1024 // 5MB
        }
    });
};

// Exporta configurações específicas pré-definidas
module.exports = {
    createMulterConfig,
    uploadDocumentos: createMulterConfig('documentos'),
    uploadJogos: createMulterConfig('jogos'),
    uploadGeral: createMulterConfig('geral')
};