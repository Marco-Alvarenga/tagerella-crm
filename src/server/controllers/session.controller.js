// src/server/controllers/session.controller.js
const pool = require('../config/database');

const sessionController = {
    // Listar agendamentos
    getAgendamentos: async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT 
                    a.agendamento_id,
                    a.data_hora,
                    a.duracao,
                    a.status,
                    a.observacoes,
                    t.usuario_id as terapeuta_id,
                    u1.nome as terapeuta_nome,
                    c.usuario_id as cliente_id,
                    u2.nome as cliente_nome,
                    ci.nome_paciente
                FROM agendamento a
                JOIN terapeuta_info t ON a.terapeuta_info_id = t.terapeuta_info_id
                JOIN usuario u1 ON t.usuario_id = u1.usuario_id
                JOIN cliente_info c ON a.cliente_info_id = c.cliente_info_id
                JOIN usuario u2 ON c.usuario_id = u2.usuario_id
                ORDER BY a.data_hora DESC
            `);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Criar agendamento
    createAgendamento: async (req, res) => {
        const client = await pool.connect();
        try {
            const { 
                terapeuta_info_id,
                cliente_info_id,
                data_hora,
                duracao,
                observacoes 
            } = req.body;

            const result = await client.query(
                `INSERT INTO agendamento 
                    (terapeuta_info_id, cliente_info_id, data_hora, duracao, observacoes) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING *`,
                [terapeuta_info_id, cliente_info_id, data_hora, duracao, observacoes]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        } finally {
            client.release();
        }
    },

    // Atualizar status do agendamento
    updateAgendamentoStatus: async (req, res) => {
        const client = await pool.connect();
        try {
            const { id } = req.params;
            const { status, observacoes } = req.body;

            const result = await client.query(
                `UPDATE agendamento 
                SET status = $1, observacoes = $2 
                WHERE agendamento_id = $3 
                RETURNING *`,
                [status, observacoes, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Agendamento não encontrado' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        } finally {
            client.release();
        }
    },

    // Iniciar sessão
    startSessao: async (req, res) => {
        const client = await pool.connect();
        try {
            const { agendamento_id } = req.params;

            await client.query('BEGIN');

            // Verifica se já existe sessão para este agendamento
            const sessaoExistente = await client.query(
                'SELECT sessao_id FROM sessao WHERE agendamento_id = $1',
                [agendamento_id]
            );

            if (sessaoExistente.rows.length > 0) {
                return res.status(400).json({ message: 'Sessão já iniciada para este agendamento' });
            }

            // Cria nova sessão
            const result = await client.query(
                `INSERT INTO sessao (agendamento_id, inicio, status)
                VALUES ($1, CURRENT_TIMESTAMP, 'em_andamento')
                RETURNING *`,
                [agendamento_id]
            );

            // Atualiza status do agendamento
            await client.query(
                `UPDATE agendamento SET status = 'em_andamento'
                WHERE agendamento_id = $1`,
                [agendamento_id]
            );

            await client.query('COMMIT');
            res.status(201).json(result.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            res.status(500).json({ error: error.message });
        } finally {
            client.release();
        }
    },

    // Finalizar sessão
    endSessao: async (req, res) => {
        const client = await pool.connect();
        try {
            const { sessao_id } = req.params;
            const { observacoes } = req.body;

            await client.query('BEGIN');

            const result = await client.query(
                `UPDATE sessao 
                SET fim = CURRENT_TIMESTAMP, status = 'finalizada', observacoes = $1
                WHERE sessao_id = $2
                RETURNING *`,
                [observacoes, sessao_id]
            );

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ message: 'Sessão não encontrada' });
            }

            // Atualiza status do agendamento
            await client.query(
                `UPDATE agendamento SET status = 'realizado'
                WHERE agendamento_id = $1`,
                [result.rows[0].agendamento_id]
            );

            await client.query('COMMIT');
            res.json(result.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            res.status(500).json({ error: error.message });
        } finally {
            client.release();
        }
    },

    // Registrar atividade na sessão
    registerAtividade: async (req, res) => {
        const client = await pool.connect();
        try {
            const { sessao_id } = req.params;
            const { jogo_id, inicio, fim, metricas, observacoes } = req.body;

            const result = await client.query(
                `INSERT INTO sessao_atividade 
                    (sessao_id, jogo_id, inicio, fim, metricas, observacoes)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                [sessao_id, jogo_id, inicio, fim, metricas, observacoes]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        } finally {
            client.release();
        }
    },

    // Listar atividades da sessão
    getAtividades: async (req, res) => {
        try {
            const { sessao_id } = req.params;
            const result = await pool.query(`
                SELECT 
                    sa.*,
                    j.nome as jogo_nome,
                    jt.nome as tipo_jogo
                FROM sessao_atividade sa
                JOIN jogo j ON sa.jogo_id = j.jogo_id
                JOIN jogo_tipo jt ON j.jogo_tipo_id = jt.jogo_tipo_id
                WHERE sa.sessao_id = $1
                ORDER BY sa.inicio
            `, [sessao_id]);

            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = sessionController;