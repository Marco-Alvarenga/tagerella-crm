// src/server/routes/client.routes.js
const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');
const checkPermission = require('../middleware/permission.middleware');

// Mapeamento de rotas antigas para novas
const permissionMap = {
    '/clients/list': '/usuarios/listar',
    '/clients/create': '/usuarios/criar',
    '/clients/edit': '/usuarios/editar',
    '/clients/delete': '/usuarios/excluir'
};

// Função para verificar permissão com mapeamento
const checkMappedPermission = (permission) => {
    return (req, res, next) => {
        const mappedPermission = permissionMap[permission] || permission;
        if (!req.user.permissoes.includes(mappedPermission)) {
            return res.status(403).json({ 
                message: 'Acesso não autorizado',
                requiredPermission: permission,
                mappedPermission: mappedPermission,
                userPermissions: req.user.permissoes 
            });
        }
        next();
    };
};

// Rotas com permissões mapeadas
router.get('/:id/history', checkMappedPermission('/clients/list'), clientController.getClientHistory);
router.get('/export/csv', checkMappedPermission('/clients/list'), clientController.exportToCSV);
router.get('/', checkMappedPermission('/clients/list'), clientController.getAllClients);
router.get('/:id', checkMappedPermission('/clients/list'), clientController.getClientById);
router.post('/', checkMappedPermission('/clients/create'), clientController.createClient);
router.put('/:id', checkMappedPermission('/clients/edit'), clientController.updateClient);
router.delete('/:id', checkMappedPermission('/clients/delete'), clientController.deleteClient);
router.put('/reactivate/:id', checkMappedPermission('/clients/edit'), clientController.reactivateClient);
router.put('/:id/password', checkMappedPermission('/clients/edit'), clientController.updatePassword);
router.delete('/:id/permanent', checkMappedPermission('/clients/delete'), clientController.permanentDelete);

module.exports = router;