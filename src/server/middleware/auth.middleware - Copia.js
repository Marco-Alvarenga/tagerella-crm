// src/server/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
			console.log('Token não fornecido'); 
            return res.status(401).json({ message: 'Token não fornecido' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
		console.log('Token decodificado:', decoded);
        
        const user = await pool.query(`
            SELECT u.*, array_agg(DISTINCT f.url) as permissoes
            FROM usuario u
            JOIN usuario_perfil up ON u.usuario_id = up.usuario_id
            JOIN perfil p ON up.perfil_id = p.perfil_id
            JOIN perfil_funcao pf ON p.perfil_id = pf.perfil_id
            JOIN funcao f ON pf.funcao_id = f.funcao_id
            WHERE u.usuario_id = $1 AND u.ativo = true
            GROUP BY u.usuario_id
        `, [decoded.id]);

        if (!user.rows[0]) {
            return res.status(401).json({ message: 'Usuário não encontrado' });
        }

        req.user = user.rows[0];
        next();
    } catch (error) {
		console.error('Erro no middleware de autenticação:', error);
        res.status(401).json({ message: 'Token inválido' });
    }
};

module.exports = authMiddleware;