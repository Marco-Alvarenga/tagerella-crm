// src/server/routes/terapeuta.routes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const terapeutaController = require('../controllers/terapeuta.controller');
const terapeutaAgendaController = require('../controllers/terapeuta-agenda.controller');
const terapeutaDocumentosController = require('../controllers/terapeuta-documentos.controller');
const terapeutaRedesController = require('../controllers/terapeuta-redes.controller');
const terapeutaConfigController = require('../controllers/terapeuta-config.controller');
const { uploadDocumentos } = require('../config/multer.config');

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Rotas principais do terapeuta
router.post('/promover/:usuario_id', terapeutaController.promoverParaTerapeuta);
router.get('/', terapeutaController.getAllTerapeutas);
//router.get('/:id', terapeutaController.getTerapeutaById);
router.get('/:id', terapeutaController.getTerapeuta);
router.get('/:id/info', terapeutaController.getTerapeutaInfo);
router.put('/:id', terapeutaController.updateTerapeuta);
router.delete('/:id', terapeutaController.desativarTerapeuta);

// Rotas de agenda
router.get('/:terapeuta_info_id/disponibilidade', terapeutaAgendaController.getDisponibilidade);
router.put('/:terapeuta_info_id/disponibilidade', terapeutaAgendaController.setDisponibilidade);
router.get('/:terapeuta_info_id/agendamentos', terapeutaAgendaController.getAgendamentos);
router.post('/agendamentos', terapeutaAgendaController.createAgendamento);
router.put('/agendamentos/:agendamento_id/status', terapeutaAgendaController.updateAgendamentoStatus);
router.get('/:terapeuta_info_id/horarios-disponiveis/:data', terapeutaAgendaController.getHorariosDisponiveis);

// Rotas de documentos
router.post('/:terapeuta_info_id/documentos',
    (req, res, next) => {
        console.log('Headers:', req.headers);
        next();
    },
    uploadDocumentos.single('documento'),
    terapeutaDocumentosController.uploadDocumento
);
router.get('/:terapeuta_info_id/documentos', terapeutaDocumentosController.listarDocumentos);
router.get('/documentos/:documento_id', terapeutaDocumentosController.getDocumento);
router.put('/documentos/:documento_id', terapeutaDocumentosController.updateDocumento);
router.delete('/documentos/:documento_id', terapeutaDocumentosController.deleteDocumento);

// Rotas de redes sociais
router.put('/:terapeuta_info_id/redes-sociais', terapeutaRedesController.updateRedesSociais);
router.get('/:terapeuta_info_id/redes-sociais', terapeutaRedesController.getRedesSociais);
router.get('/redes-sociais-disponiveis', terapeutaRedesController.getRedesSociaisDisponiveis);

// Rotas de localização e contato
router.put('/:terapeuta_info_id/contato', terapeutaRedesController.updateContato);
router.get('/:terapeuta_info_id/contato', terapeutaRedesController.getContato);
router.get('/paises', terapeutaRedesController.getPaises);
router.get('/estados/:pais_id', terapeutaRedesController.getEstados);
router.get('/cidades/:estado_id', terapeutaRedesController.getCidades);

// Rotas de configurações
router.put('/:terapeuta_info_id/financeiro', terapeutaConfigController.updateInfoFinanceira);
router.put('/:terapeuta_info_id/profissional', terapeutaConfigController.updateInfoProfissional);
router.get('/profissoes', terapeutaConfigController.getProfissoes);
router.get('/especialidades', terapeutaConfigController.getEspecialidades);
router.get('/areas-atuacao', terapeutaConfigController.getAreasAtuacao);
router.get('/:terapeuta_info_id/profissoes', terapeutaConfigController.getProfissoes);
router.get('/:terapeuta_info_id/especialidades', terapeutaConfigController.getEspecialidades);
router.get('/:terapeuta_info_id/areas-atuacao', terapeutaConfigController.getAreasAtuacao);


// Rotas de foto e assinatura
router.post('/:terapeuta_info_id/foto', 
    terapeutaConfigController.upload.single('foto'), 
    terapeutaConfigController.updateFotoPerfil
);
router.post('/:terapeuta_info_id/assinatura', 
    terapeutaConfigController.upload.single('assinatura'), 
    terapeutaConfigController.updateAssinatura
);

module.exports = router;