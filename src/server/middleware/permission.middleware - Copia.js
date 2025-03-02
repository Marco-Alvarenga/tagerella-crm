// src/server/middleware/permission.middleware.js
const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.user.permissoes.includes(requiredPermission)) {
            return res.status(403).json({ message: 'Acesso não autorizado' });
        }
        next();
    };
};

module.exports = checkPermission;