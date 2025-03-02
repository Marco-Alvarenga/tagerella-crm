// src/server/routes/jogos.routes.js
const express = require('express');
const router = express.Router();

const menuController = require('../controllers/menu.controller');
const jogoController = require('../controllers/jogo.controller');
const jogoTipoController = require('../controllers/jogo.tipo.controller');
const uploadController = require('../controllers/multer.controller');

// Jogo routes
router.get('/jogos/:id/config', jogoController.getJogoConfig);
router.get('/jogos/:id/images', jogoController.getJogoImages);
router.post('/jogos/config', jogoController.createJogoConfig);
router.get('/jogos/check-config/:id', jogoController.checkJogoConfig);
router.post('/jogos/init-config', jogoController.initializeJogoConfig);
router.get('/jogos', jogoController.getAllJogos);
router.post('/jogos', jogoController.createJogo);
router.put('/jogos/:id/config', jogoController.updateJogoConfig);
router.delete('/jogos/:id', jogoController.deleteJogo);

// Menu routes
router.get('/menu', menuController.getMenuStructure);
router.post('/menu', menuController.createMenuItem);
router.put('/menu/:id', menuController.updateMenuItem);
router.delete('/menu/:id', menuController.deleteMenuItem);
router.put('/menu/:id/reactivate', menuController.reactivateMenuItem);
router.delete('/menu/:id/permanent', menuController.permanentDeleteMenuItem);
router.get('/menu/children/:parentId', menuController.getMenuChildren);

// Jogo Tipo routes
router.get('/tipos', jogoTipoController.getAllTipos);
router.get('/tipos/:id', jogoTipoController.getTipoById);
router.get('/tipos/:id/jogos', jogoTipoController.getJogosByTipo);

// Upload routes
router.post('/upload/single/:jogoId', uploadController.upload.single('image'), uploadController.handleSingleUpload);
router.post('/upload/multiple/:jogoId', uploadController.upload.array('images', 10), uploadController.handleMultipleUpload);
router.delete('/upload/:jogoId/:filename', uploadController.removeFile);
router.delete('/upload/:jogoId', uploadController.clearDirectory);

module.exports = router;