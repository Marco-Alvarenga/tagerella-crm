// src/server/routes/api.js
const express = require('express');
const router = express.Router();
const terapeutaController = require('../controllers/terapeuta.controller');
const terapeutaAgendaController = require('../controllers/terapeuta-agenda.controller');
const terapeutaDocumentosController = require('../controllers/terapeuta-documentos.controller');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../config/multer.config');
const { uploadDocumentos } = require('../config/multer.config');

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Rotas principais do terapeuta
router.get('/terapeutas', terapeutaController.getAllTerapeutas);
router.get('/terapeutas/:id', terapeutaController.getTerapeutaById);
router.put('/terapeutas/:id', terapeutaController.updateTerapeuta);
router.delete('/terapeutas/:id', terapeutaController.deleteTerapeuta);

// Promoção de cliente para terapeuta
router.post('/clients/:id/promote', terapeutaController.promoteToTerapeuta);

// Rotas de especialidades e áreas
router.get('/profissoes', terapeutaController.getProfissoes);
router.get('/especialidades', terapeutaController.getEspecialidades);
router.get('/areas-atuacao', terapeutaController.getAreasAtuacao);

router.put('/terapeutas/:id/especialidades', terapeutaController.updateEspecialidades);
router.put('/terapeutas/:id/areas', terapeutaController.updateAreas);

// Rotas de documentos
router.post('/terapeutas/:id/documentos',
    upload.single('documento'),
    terapeutaDocumentosController.uploadDocumento
);
router.get('/terapeutas/:id/documentos', terapeutaDocumentosController.listarDocumentos);
router.get('/documentos/:id', terapeutaDocumentosController.getDocumento);
router.delete('/documentos/:id', terapeutaDocumentosController.deleteDocumento);

// Rotas de disponibilidade e agenda
router.get('/terapeutas/:id/disponibilidade', terapeutaAgendaController.getDisponibilidade);
router.put('/terapeutas/:id/disponibilidade', terapeutaAgendaController.setDisponibilidade);
router.get('/terapeutas/:id/agendamentos', terapeutaAgendaController.getAgendamentos);
router.post('/agendamentos', terapeutaAgendaController.createAgendamento);
router.put('/agendamentos/:id', terapeutaAgendaController.updateAgendamento);
router.delete('/agendamentos/:id', terapeutaAgendaController.cancelAgendamento);

// Rotas de configuração
router.post('/terapeutas/:id/foto', 
    upload.single('foto'), 
    terapeutaController.updateFotoPerfil
);
router.post('/terapeutas/:id/assinatura', 
    upload.single('assinatura'), 
    terapeutaController.updateAssinatura
);

module.exports = router;