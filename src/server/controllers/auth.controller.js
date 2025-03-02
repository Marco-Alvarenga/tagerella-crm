// src/server/controllers/auth.controller.js
const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

// Novo: Funções de validação
const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);
    
    if (!password || password.length < minLength) {
        return { valid: false, message: 'A senha deve ter pelo menos 8 caracteres' };
    }
    if (!hasUpperCase) {
        return { valid: false, message: 'A senha deve conter pelo menos uma letra maiúscula' };
    }
    if (!hasLowerCase) {
        return { valid: false, message: 'A senha deve conter pelo menos uma letra minúscula' };
    }
    if (!hasNumbers) {
        return { valid: false, message: 'A senha deve conter pelo menos um número' };
    }
    if (!hasSpecialChar) {
        return { valid: false, message: 'A senha deve conter pelo menos um caractere especial (!@#$%^&*)' };
    }
    
    return { valid: true };
};

// Novo: Sistema básico de rate limiting usando memória
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutos em milissegundos

const checkLoginAttempts = async (email) => {
    try {
        const result = await pool.query(`
            SELECT COUNT(*) as attempt_count, 
                   MAX(created_at) as last_attempt,
                   bool_or(is_blocked) as is_blocked
            FROM login_history 
            WHERE email = $1 
            AND success = false
            AND created_at > NOW() - INTERVAL '15 minutes'
        `, [email]);

        const { attempt_count, last_attempt, is_blocked } = result.rows[0];

        if (is_blocked) {
            // Verificar se já passou o tempo de bloqueio
            const now = new Date();
            const lastAttemptTime = new Date(last_attempt);
            const timeSinceLastAttempt = now - lastAttemptTime;
            
            if (timeSinceLastAttempt > (15 * 60 * 1000)) { // 15 minutos
                // Desbloquear após o período
                await pool.query(`
                    UPDATE login_history 
                    SET is_blocked = false 
                    WHERE email = $1
                `, [email]);
                return true;
            }
            return false; // Ainda bloqueado
        }

        return attempt_count < MAX_ATTEMPTS;
    } catch (error) {
        console.error('Erro ao verificar tentativas de login:', error);
        return false;
    }
};

const recordLoginAttempt = async (email, success, userId = null, ipAddress) => {
    try {
        if (!success) {
            // Verificar quantidade de tentativas recentes
            const result = await pool.query(`
                SELECT COUNT(*) as recent_attempts 
                FROM login_history 
                WHERE email = $1 
                AND success = false 
                AND created_at > NOW() - INTERVAL '15 minutes'
            `, [email]);

            const recentAttempts = result.rows[0].recent_attempts + 1;
            const shouldBlock = recentAttempts >= MAX_ATTEMPTS;

            await pool.query(`
                INSERT INTO login_history (
                    usuario_id,
                    email,
                    success,
                    ip_address,
                    attempts_count,
                    is_blocked
                ) VALUES ($1, $2, $3, $4, $5, $6)
            `, [userId, email || null, success, ipAddress, recentAttempts, shouldBlock]);
        } else {
            // Registrar login bem-sucedido
            await pool.query(`
                INSERT INTO login_history (
                    usuario_id,
                    email,
                    success,
                    ip_address,
                    attempts_count,
                    is_blocked
                ) VALUES ($1, $2, $3, $4, $5, $6)
            `, [userId, email || null, true, ipAddress, 0, false]);
        }
    } catch (error) {
        console.error('Erro ao registrar tentativa de login:', error);
    }
};

const authController = {
    // Login
    login: async (req, res) => {
		try {
			const { email, senha } = req.body;
			const ipAddress = req.ip;
		
			// Novo: Verificar rate limiting		
			const canAttempt = await checkLoginAttempts(email);
        if (!canAttempt) {
            return res.status(429).json({ 
                message: 'Conta temporariamente bloqueada devido a múltiplas tentativas de login. Tente novamente em 15 minutos.'
            });
        }
	
	
			// Busca usuário e suas permissões (mantém a query existente)
			const result = await pool.query(`
				SELECT 
					u.usuario_id,
					u.nome,
					u.email,
					u.senha,
					p.perfil_id,
					p.nome as perfil_nome,
					array_agg(DISTINCT f.url) as permissoes
				FROM usuario u
				JOIN usuario_perfil up ON u.usuario_id = up.usuario_id
				JOIN perfil p ON up.perfil_id = p.perfil_id
				JOIN perfil_funcao pf ON p.perfil_id = pf.perfil_id
				JOIN funcao f ON pf.funcao_id = f.funcao_id
				WHERE u.email = $1 AND u.ativo = true
				GROUP BY u.usuario_id, p.perfil_id
			`, [email]);
	
			if (result.rows.length === 0) {
				await recordLoginAttempt(email, false, null, ipAddress);
				return res.status(401).json({ message: 'Usuário não encontrado' });
			}
	
			const user = result.rows[0];
	
			// Verifica senha
			const senhaValida = await bcrypt.compare(senha, user.senha);
			if (!senhaValida) {
				await recordLoginAttempt(email, false, user.usuario_id, ipAddress);
				return res.status(401).json({ message: 'Senha inválida' });
			}
	
			// Login bem sucedido
			await recordLoginAttempt(email, true, user.usuario_id, ipAddress);
	
			// Gera token JWT (mantém o código existente)
			const token = jwt.sign(
				{ 
					id: user.usuario_id,
					perfil: user.perfil_nome,
					permissoes: user.permissoes
				},
				process.env.JWT_SECRET,
				{ expiresIn: '8h' }
			);
	
			// Atualiza último acesso (mantém o código existente)
			await pool.query(
				'UPDATE usuario SET ultimo_acesso = CURRENT_TIMESTAMP WHERE usuario_id = $1',
				[user.usuario_id]
		);
	
			res.json({
				token,
				user: {
					id: user.usuario_id,
					nome: user.nome,
					email: user.email,
					perfil: user.perfil_nome,
					permissoes: user.permissoes
				}
			});
	
		} catch (error) {
			console.error('Erro no login:', error);
			res.status(500).json({ error: error.message });
		}
    },



    // Validar token
    validateToken: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'Token não fornecido' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Verifica se usuário ainda está ativo
            const result = await pool.query(
                'SELECT ativo FROM usuario WHERE usuario_id = $1',
                [decoded.id]
            );

            if (!result.rows[0]?.ativo) {
                return res.status(401).json({ message: 'Usuário inativo' });
            }

            res.json({ valid: true, user: decoded });

        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expirado' });
            }
            res.status(401).json({ message: 'Token inválido' });
        }
    },

    // Alterar senha
    changePassword: async (req, res) => {
        const client = await pool.connect();
        try {
            const { usuario_id } = req.user; // Vem do middleware de autenticação
            const { senha_atual, nova_senha } = req.body;

            // Verifica senha atual
            const result = await client.query(
                'SELECT senha FROM usuario WHERE usuario_id = $1',
                [usuario_id]
            );

            const senhaValida = await bcrypt.compare(senha_atual, result.rows[0].senha);
            if (!senhaValida) {
                return res.status(400).json({ message: 'Senha atual inválida' });
            }

            // Gera hash da nova senha
            const salt = await bcrypt.genSalt(10);
            const hashSenha = await bcrypt.hash(nova_senha, salt);

            // Atualiza senha
            await client.query(
                'UPDATE usuario SET senha = $1 WHERE usuario_id = $2',
                [hashSenha, usuario_id]
            );

            res.json({ message: 'Senha alterada com sucesso' });

        } catch (error) {
            res.status(500).json({ error: error.message });
        } finally {
            client.release();
        }
    },

    // Recuperar senha (envia email com token)
    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;

            const result = await pool.query(
                'SELECT usuario_id FROM usuario WHERE email = $1 AND ativo = true',
                [email]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            // Gera token temporário
            const resetToken = jwt.sign(
                { id: result.rows[0].usuario_id },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            // Aqui implementaria o envio de email
            // Por enquanto apenas retorna o token
            res.json({ 
                message: 'Instruções enviadas para o email',
                resetToken // Em produção, remover
            });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Reset de senha (com token)
    resetPassword: async (req, res) => {
        try {
            const { token, nova_senha } = req.body;

            // Verifica token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Gera hash da nova senha
            const salt = await bcrypt.genSalt(10);
            const hashSenha = await bcrypt.hash(nova_senha, salt);

            // Atualiza senha
            await pool.query(
                'UPDATE usuario SET senha = $1 WHERE usuario_id = $2',
                [hashSenha, decoded.id]
            );

            res.json({ message: 'Senha redefinida com sucesso' });

        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expirado' });
            }
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = authController;