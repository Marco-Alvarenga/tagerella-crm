// src/server/controllers/multer.controller.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

class UploadController {
    constructor() {
        this.storage = multer.diskStorage({
            destination: (req, file, cb) => {
                // Agora usa jogo_id em vez de informação_id
                const uploadDir = path.join(__dirname, '../../../uploads', req.params.jogo_id);
                
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                
                cb(null, uploadDir);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, uniqueSuffix + path.extname(file.originalname));
            }
        });

        this.fileFilter = (req, file, cb) => {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Tipo de arquivo não suportado'), false);
            }
        };

        this.upload = multer({
            storage: this.storage,
            fileFilter: this.fileFilter,
            limits: {
                fileSize: 5 * 1024 * 1024 // 5MB
            }
        });
    }

    async handleMultipleUpload(req, res) {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: 'Nenhum arquivo enviado' });
            }

            const files = req.files.map(file => 
                `/uploads/${req.params.jogo_id}/${file.filename}`
            );

            res.json({ 
                message: 'Upload realizado com sucesso',
                files: files
            });
        } catch (error) {
            console.error('Erro no upload:', error);
            res.status(500).json({ error: 'Erro no processamento do upload' });
        }
    }

    async handleSingleUpload(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Nenhum arquivo enviado' });
            }

            const path = `/uploads/${req.params.jogo_id}/${req.file.filename}`;

            res.json({ 
                message: 'Upload realizado com sucesso',
                path: path
            });
        } catch (error) {
            console.error('Erro no upload:', error);
            res.status(500).json({ error: 'Erro no processamento do upload' });
        }
    }

    // Método para remover arquivo
    async removeFile(req, res) {
        try {
            const { jogo_id, filename } = req.params;
            const filePath = path.join(__dirname, '../../../uploads', jogo_id, filename);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                res.json({ message: 'Arquivo removido com sucesso' });
            } else {
                res.status(404).json({ error: 'Arquivo não encontrado' });
            }
        } catch (error) {
            console.error('Erro ao remover arquivo:', error);
            res.status(500).json({ error: 'Erro ao remover arquivo' });
        }
    }

    // Método para limpar diretório
    async clearDirectory(req, res) {
        try {
            const { jogo_id } = req.params;
            const dirPath = path.join(__dirname, '../../../uploads', jogo_id);

            if (fs.existsSync(dirPath)) {
                fs.readdirSync(dirPath).forEach(file => {
                    fs.unlinkSync(path.join(dirPath, file));
                });
                res.json({ message: 'Diretório limpo com sucesso' });
            } else {
                res.status(404).json({ error: 'Diretório não encontrado' });
            }
        } catch (error) {
            console.error('Erro ao limpar diretório:', error);
            res.status(500).json({ error: 'Erro ao limpar diretório' });
        }
    }
}

const uploadController = new UploadController();

module.exports = {
    upload: uploadController.upload,
    handleMultipleUpload: uploadController.handleMultipleUpload.bind(uploadController),
    handleSingleUpload: uploadController.handleSingleUpload.bind(uploadController),
    removeFile: uploadController.removeFile.bind(uploadController),
    clearDirectory: uploadController.clearDirectory.bind(uploadController)
};