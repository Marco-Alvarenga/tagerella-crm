// src/server/routes/promotion.routes.js
const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotion.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rota de promoção
router.post('/clients/:usuario_id/promote-to-terapeuta', promotionController.promoteToTerapeuta);

// Rotas auxiliares
router.get('/profissoes', promotionController.getProfissoes);
router.get('/especialidades', promotionController.getEspecialidades);
router.get('/areas-atuacao', promotionController.getAreasAtuacao);

module.exports = router;