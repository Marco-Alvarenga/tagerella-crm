// src/server/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const env = require('../config/env');

const authMiddleware = async (req, res, next) => {
    try {
        // Verificar se tem token
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Token não fornecido' });
        }

        // Verificar validade do token
        const decoded = jwt.verify(token, env.jwt.secret);
        
        // Verificar se usuário existe e está ativo
        const userResult = await pool.query(`
            SELECT 
                u.usuario_id,
                u.ativo,
                array_agg(DISTINCT p.nome) as perfis,
                array_agg(DISTINCT f.url) as permissoes
            FROM usuario u
            JOIN usuario_perfil up ON u.usuario_id = up.usuario_id
            JOIN perfil p ON up.perfil_id = p.perfil_id
            JOIN perfil_funcao pf ON p.perfil_id = pf.perfil_id
            JOIN funcao f ON pf.funcao_id = f.funcao_id
            WHERE u.usuario_id = $1
            GROUP BY u.usuario_id
        `, [decoded.id]);

        if (userResult.rows.length === 0 || !userResult.rows[0].ativo) {
            return res.status(401).json({ message: 'Usuário inativo ou não encontrado' });
        }

        const user = userResult.rows[0];

        // Se é admin, permite tudo
        const isAdmin = user.perfis.includes('Administrador');
        if (isAdmin) {
            req.user = {
                usuario_id: user.usuario_id,
                perfis: user.perfis,
                permissoes: user.permissoes,
                isAdmin: true
            };
            return next();
        }

        // Verificar permissões
        const url = req.baseUrl + req.path; // Pega o caminho sem query params
        const temPermissao = user.permissoes.some(permissao => {
            // Converte padrões de URL em regex
            const pattern = permissao
                .replace(/:[^/]+/g, '[^/]+') // Substitui :param por qualquer coisa exceto /
                .replace(/\//g, '\\/'); // Escapa as /
            const regex = new RegExp(`^${pattern}$`);
            return regex.test(url);
        });

        if (!temPermissao) {
            return res.status(403).json({ 
                message: 'Sem permissão para acessar este recurso',
                url: url,
                userPermissions: user.permissoes
            });
        }

        // Adicionar usuário ao request
        req.user = {
            usuario_id: user.usuario_id,
            perfis: user.perfis,
            permissoes: user.permissoes,
            isAdmin: false
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token inválido' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado' });
        }
        
        console.error('Erro no middleware de autenticação:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};

module.exports = authMiddleware;