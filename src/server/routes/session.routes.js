// src/server/routes/session.routes.js
const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');

// Rotas de Agendamento
router.get('/agendamentos', sessionController.getAgendamentos);
router.post('/agendamentos', sessionController.createAgendamento);
router.put('/agendamentos/:id/status', sessionController.updateAgendamentoStatus);

// Rotas de Sessão
router.post('/agendamentos/:agendamento_id/sessao', sessionController.startSessao);
router.put('/sessao/:sessao_id/finalizar', sessionController.endSessao);

// Rotas de Atividades
router.post('/sessao/:sessao_id/atividades', sessionController.registerAtividade);
router.get('/sessao/:sessao_id/atividades', sessionController.getAtividades);

module.exports = router;