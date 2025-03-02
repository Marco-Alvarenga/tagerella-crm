// src/server/routes/upload.routes.js
const express = require('express');
const router = express.Router();
const { 
    upload, 
    handleMultipleUpload, 
    handleSingleUpload,
    removeFile,
    clearDirectory 
} = require('../controllers/multer.controller');

// Rotas de Upload
router.post('/multiple/:jogo_id', upload.array('images', 10), handleMultipleUpload);
router.post('/single/:jogo_id', upload.single('image'), handleSingleUpload);
router.delete('/:jogo_id/:filename', removeFile);
router.delete('/:jogo_id', clearDirectory);

module.exports = router;