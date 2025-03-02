// src/server/controllers/promotion.controller.js
const pool = require('../config/database');

const promotionController = {
    promoteToTerapeuta: async (req, res) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const { usuario_id } = req.params;
            const {
                registro_numero,
                registro_sigla,
                registro_validade,
                profissao_id
            } = req.body;

            // Verificar se usuário existe e está ativo
            const userCheck = await client.query(
                'SELECT usuario_id FROM usuario WHERE usuario_id = $1 AND ativo = true',
                [usuario_id]
            );

            if (userCheck.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ message: 'Usuário não encontrado ou inativo' });
            }

            // Verificar se já é terapeuta
            const terapeutaCheck = await client.query(
                'SELECT terapeuta_info_id FROM terapeuta_info WHERE usuario_id = $1',
                [usuario_id]
            );

            if (terapeutaCheck.rows.length > 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: 'Usuário já é terapeuta' });
            }

            // Criar registro de terapeuta
            const terapeutaResult = await client.query(`
                INSERT INTO terapeuta_info (
                    usuario_id,
                    registro_numero,
                    registro_sigla,
                    registro_validade,
                    profissao_id,
                    valor_sessao,
                    tempo_sessao,
                    modalidade_atendimento
                ) VALUES ($1, $2, $3, $4, $5, 0, 50, 'presencial')
                RETURNING terapeuta_info_id
            `, [
                usuario_id,
                registro_numero,
                registro_sigla,
                registro_validade,
                profissao_id
            ]);

            // Adicionar perfil de terapeuta
            const perfilResult = await client.query(
                'SELECT perfil_id FROM perfil WHERE nome = $1',
                ['Terapeuta']
            );

            await client.query(
                'INSERT INTO usuario_perfil (usuario_id, perfil_id) VALUES ($1, $2)',
                [usuario_id, perfilResult.rows[0].perfil_id]
            );

            // Registrar na auditoria
            await client.query(`
                INSERT INTO audit_log (
                    usuario_id,
                    acao,
                    tabela,
                    registro_id,
                    dados_novos
                ) VALUES ($1, 'promocao_terapeuta', 'terapeuta_info', $2, $3)
            `, [
                req.user.usuario_id,
                terapeutaResult.rows[0].terapeuta_info_id,
                JSON.stringify({
                    registro_numero,
                    registro_sigla,
                    registro_validade,
                    profissao_id
                })
            ]);

            await client.query('COMMIT');

            res.status(201).json({
                message: 'Cliente promovido para terapeuta com sucesso',
                terapeuta_info_id: terapeutaResult.rows[0].terapeuta_info_id
            });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erro ao promover terapeuta:', error);
            res.status(500).json({
                message: 'Erro ao promover cliente para terapeuta',
                error: error.message
            });
        } finally {
            client.release();
        }
    },

    // Endpoints auxiliares
    getProfissoes: async (req, res) => {
        try {
            const result = await pool.query(
                'SELECT profissao_id, nome FROM profissoes WHERE ativo = true ORDER BY nome'
            );
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao buscar profissões' });
        }
    },

    getEspecialidades: async (req, res) => {
        try {
            const result = await pool.query(
                'SELECT especialidade_id, nome FROM especialidades WHERE ativo = true ORDER BY nome'
            );
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao buscar especialidades' });
        }
    },

    getAreasAtuacao: async (req, res) => {
        try {
            const result = await pool.query(
                'SELECT area_id, nome FROM areas_atuacao WHERE ativo = true ORDER BY nome'
            );
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao buscar áreas de atuação' });
        }
    }
};

module.exports = promotionController;