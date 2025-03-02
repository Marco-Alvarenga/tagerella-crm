// src/server/middleware/permission.middleware.js
const permissionMiddleware = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            const permissionResult = await pool.query(
                'SELECT check_permission($1, $2) as tem_permissao',
                [req.user.usuario_id, requiredPermission]
            );

            if (!permissionResult.rows[0].tem_permissao) {
                return res.status(403).json({ 
                    message: 'Sem permissão para esta operação',
                    required: requiredPermission
                });
            }

            next();
        } catch (error) {
            console.error('Erro na verificação de permissão:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    };
};

module.exports = permissionMiddleware;