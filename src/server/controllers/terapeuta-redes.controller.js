// src/server/controllers/terapeuta-redes.controller.js
const pool = require('../config/database');

const terapeutaRedesController = {
    // Adicionar/atualizar redes sociais
    updateRedesSociais: async (req, res) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const { terapeuta_info_id } = req.params;
            const { redes } = req.body;

            // Remove redes sociais existentes
            await client.query(
                'DELETE FROM terapeuta_redes_sociais WHERE terapeuta_info_id = $1',
                [terapeuta_info_id]
            );

            // Insere novas redes sociais
            if (redes && redes.length > 0) {
                const values = redes.map(rede => 
                    `(${terapeuta_info_id}, ${rede.rede_social_id}, '${rede.url}')`
                ).join(',');

                await client.query(`
                    INSERT INTO terapeuta_redes_sociais 
                    (terapeuta_info_id, rede_social_id, url)
                    VALUES ${values}
                `);
            }

            await client.query('COMMIT');
            res.json({ message: 'Redes sociais atualizadas com sucesso' });

        } catch (error) {
            await client.query('ROLLBACK');
            res.status(500).json({ error: error.message });
        } finally {
            client.release();
        }
    },

    // Listar redes sociais do terapeuta
    getRedesSociais: async (req, res) => {
        try {
            const { terapeuta_info_id } = req.params;

            const result = await pool.query(`
                SELECT 
                    trs.rede_social_id,
                    rs.nome as rede_social_nome,
                    rs.icone_url,
                    trs.url
                FROM terapeuta_redes_sociais trs
                JOIN redes_sociais rs ON trs.rede_social_id = rs.rede_social_id
                WHERE trs.terapeuta_info_id = $1
                ORDER BY rs.nome
            `, [terapeuta_info_id]);

            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Listar todas as redes sociais disponíveis
    getRedesSociaisDisponiveis: async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT rede_social_id, nome, icone_url
                FROM redes_sociais
                ORDER BY nome
            `);

            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Atualizar informações de contato
    updateContato: async (req, res) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const { terapeuta_info_id } = req.params;
            const { pais_id, estado_id, cidade_id, timezone } = req.body;

            // Atualiza informações de localização e contato
            await client.query(`
                UPDATE terapeuta_info
                SET 
                    pais_id = $1,
                    estado_id = $2,
                    cidade_id = $3,
                    timezone = $4
                WHERE terapeuta_info_id = $5
            `, [pais_id, estado_id, cidade_id, timezone, terapeuta_info_id]);

            await client.query('COMMIT');
            res.json({ message: 'Informações de contato atualizadas com sucesso' });

        } catch (error) {
            await client.query('ROLLBACK');
            res.status(500).json({ error: error.message });
        } finally {
            client.release();
        }
    },

    // Buscar informações de contato
    getContato: async (req, res) => {
        try {
            const { terapeuta_info_id } = req.params;

            const result = await pool.query(`
                SELECT 
                    ti.pais_id,
                    p.nome as pais_nome,
                    ti.estado_id,
                    e.nome as estado_nome,
                    ti.cidade_id,
                    c.nome as cidade_nome,
                    ti.timezone
                FROM terapeuta_info ti
                LEFT JOIN paises p ON ti.pais_id = p.pais_id
                LEFT JOIN estados e ON ti.estado_id = e.estado_id
                LEFT JOIN cidades c ON ti.cidade_id = c.cidade_id
                WHERE ti.terapeuta_info_id = $1
            `, [terapeuta_info_id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Terapeuta não encontrado' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Buscar países
    getPaises: async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT pais_id, nome, codigo, timezone_padrao
                FROM paises
                ORDER BY nome
            `);

            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Buscar estados por país
    getEstados: async (req, res) => {
        try {
            const { pais_id } = req.params;

            const result = await pool.query(`
                SELECT estado_id, nome, uf
                FROM estados
                WHERE pais_id = $1
                ORDER BY nome
            `, [pais_id]);

            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Buscar cidades por estado
    getCidades: async (req, res) => {
        try {
            const { estado_id } = req.params;

            const result = await pool.query(`
                SELECT cidade_id, nome, timezone
                FROM cidades
                WHERE estado_id = $1
                ORDER BY nome
            `, [estado_id]);

            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = terapeutaRedesController;