// src/server/controllers/jogo.tipo.controller.js
const pool = require('../config/database');

const jogoTipoController = {
    // Listar todos os tipos de jogos
    getAllTipos: async (req, res) => {
        try {
            const result = await pool.query('SELECT * FROM jogo_tipo ORDER BY nome');
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obter tipo específico
    getTipoById: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await pool.query(
                'SELECT * FROM jogo_tipo WHERE jogo_tipo_id = $1',
                [id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Tipo de jogo não encontrado' });
            }
            
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Criar novo tipo de jogo
    createTipo: async (req, res) => {
        try {
            const { nome, descricao } = req.body;
            const result = await pool.query(
                'INSERT INTO jogo_tipo (nome, descricao) VALUES ($1, $2) RETURNING *',
                [nome, descricao]
            );
            res.status(201).json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Atualizar tipo de jogo
    updateTipo: async (req, res) => {
        try {
            const { id } = req.params;
            const { nome, descricao } = req.body;
            const result = await pool.query(
                'UPDATE jogo_tipo SET nome = $1, descricao = $2 WHERE jogo_tipo_id = $3 RETURNING *',
                [nome, descricao, id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Tipo de jogo não encontrado' });
            }
            
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Listar jogos por tipo
    getJogosByTipo: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await pool.query(`
                SELECT 
                    j.jogo_id,
                    j.nome,
                    j.sort,
                    jc.*
                FROM jogo j
                LEFT JOIN jogo_config jc ON j.jogo_id = jc.jogo_id
                WHERE j.jogo_tipo_id = $1 AND j.ativo = true
                ORDER BY j.sort
            `, [id]);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = jogoTipoController;