// src/server/controllers/terapeuta.controller.js
const pool = require('../config/database');
const bcrypt = require('bcrypt');

const terapeutaController = {
    // Transformar cliente em terapeuta
    promoverParaTerapeuta: async (req, res) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const { usuario_id } = req.params;
            const {
                profissao_id,
                registro_numero,
                registro_sigla,
                registro_validade,
                valor_sessao,
                tempo_sessao,
                modalidade_atendimento,
                especialidades,
                areas_atuacao
            } = req.body;

            // Verifica se já é terapeuta
            const terapeutaExists = await client.query(
                'SELECT terapeuta_info_id FROM terapeuta_info WHERE usuario_id = $1',
                [usuario_id]
            );

            if (terapeutaExists.rows.length > 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: 'Usuário já é terapeuta' });
            }

            // Cria registro de terapeuta
            const terapeutaResult = await client.query(
                `INSERT INTO terapeuta_info (
                    usuario_id,
                    profissao_id,
                    registro_numero,
                    registro_sigla,
                    registro_validade,
                    valor_sessao,
                    tempo_sessao,
                    modalidade_atendimento
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING terapeuta_info_id`,
                [
                    usuario_id,
                    profissao_id,
                    registro_numero,
                    registro_sigla,
                    registro_validade,
                    valor_sessao,
                    tempo_sessao,
                    modalidade_atendimento
                ]
            );

            const terapeuta_info_id = terapeutaResult.rows[0].terapeuta_info_id;

            // Adiciona especialidades
            if (especialidades && especialidades.length > 0) {
                const especialidadesValues = especialidades.map(esp_id =>
                    `(${terapeuta_info_id}, ${esp_id})`
                ).join(',');

                await client.query(`
                    INSERT INTO terapeuta_especialidades (terapeuta_info_id, especialidade_id)
                    VALUES ${especialidadesValues}
                `);
            }

            // Adiciona áreas de atuação
            if (areas_atuacao && areas_atuacao.length > 0) {
                const areasValues = areas_atuacao.map(area_id =>
                    `(${terapeuta_info_id}, ${area_id})`
                ).join(',');

                await client.query(`
                    INSERT INTO terapeuta_areas (terapeuta_info_id, area_id)
                    VALUES ${areasValues}
                `);
            }

            // Adiciona perfil de terapeuta
            const perfilResult = await client.query(
                'SELECT perfil_id FROM perfil WHERE nome = $1',
                ['Terapeuta']
            );

            await client.query(
                'INSERT INTO usuario_perfil (usuario_id, perfil_id) VALUES ($1, $2)',
                [usuario_id, perfilResult.rows[0].perfil_id]
            );

            await client.query('COMMIT');

            res.status(201).json({
                message: 'Usuário promovido a terapeuta com sucesso',
                terapeuta_info_id
            });

        } catch (error) {
            await client.query('ROLLBACK');
            res.status(500).json({ error: error.message });
        } finally {
            client.release();
        }
    },

    // Buscar todos os terapeutas
    getAllTerapeutas: async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT 
                    u.usuario_id,
                    u.nome,
                    u.email,
                    t.terapeuta_info_id,
                    t.registro_numero,
                    t.registro_sigla,
                    t.valor_sessao,
                    t.tempo_sessao,
                    t.modalidade_atendimento,
                    p.nome as profissao,
                    array_agg(DISTINCT e.nome) as especialidades,
                    array_agg(DISTINCT a.nome) as areas_atuacao
                FROM usuario u
                JOIN terapeuta_info t ON u.usuario_id = t.usuario_id
                LEFT JOIN profissoes p ON t.profissao_id = p.profissao_id
                LEFT JOIN terapeuta_especialidades te ON t.terapeuta_info_id = te.terapeuta_info_id
                LEFT JOIN especialidades e ON te.especialidade_id = e.especialidade_id
                LEFT JOIN terapeuta_areas ta ON t.terapeuta_info_id = ta.terapeuta_info_id
                LEFT JOIN areas_atuacao a ON ta.area_id = a.area_id
                WHERE u.ativo = true
                GROUP BY u.usuario_id, t.terapeuta_info_id, p.nome
                ORDER BY u.nome
            `);

            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Buscar terapeuta por ID
    getTerapeutaById: async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(`
            SELECT 
                u.usuario_id,
                u.nome,
                u.email,
                ti.*,
                p.nome as profissao_nome,
                c.nome as cidade_nome,
                e.nome as estado_nome,
                pa.nome as pais_nome,
                (
                    SELECT json_agg(esp.*)
                    FROM terapeuta_especialidades te
                    JOIN especialidades esp ON te.especialidade_id = esp.especialidade_id
                    WHERE te.terapeuta_info_id = ti.terapeuta_info_id
                ) as especialidades,
                (
                    SELECT json_agg(a.*)
                    FROM terapeuta_areas ta
                    JOIN areas_atuacao a ON ta.area_id = a.area_id
                    WHERE ta.terapeuta_info_id = ti.terapeuta_info_id
                ) as areas_atuacao,
                (
                    SELECT json_agg(json_build_object(
                        'rede_id', rs.rede_social_id,
                        'nome', rs.nome,
                        'url', trs.url
                    ))
                    FROM terapeuta_redes_sociais trs
                    JOIN redes_sociais rs ON trs.rede_social_id = rs.rede_social_id
                    WHERE trs.terapeuta_info_id = ti.terapeuta_info_id
                ) as redes_sociais
            FROM usuario u
            JOIN terapeuta_info ti ON u.usuario_id = ti.usuario_id
            LEFT JOIN profissoes p ON ti.profissao_id = p.profissao_id
            LEFT JOIN cidades c ON ti.cidade_id = c.cidade_id
            LEFT JOIN estados e ON ti.estado_id = e.estado_id
            LEFT JOIN paises pa ON ti.pais_id = pa.pais_id
            WHERE ti.terapeuta_info_id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Terapeuta não encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar terapeuta:', error);
        res.status(500).json({ message: 'Erro ao buscar terapeuta' });
    }
    },
	

    getTerapeuta: async (req, res) => {
        try {
        const { id } = req.params;
        
        const result = await pool.query(`
            SELECT 
                u.usuario_id,
                u.nome,
                u.email,
                ti.*,
                p.nome as profissao_nome,
                c.nome as cidade_nome,
                e.nome as estado_nome,
                pa.nome as pais_nome,
                (
                    SELECT json_agg(esp.*)
                    FROM terapeuta_especialidades te
                    JOIN especialidades esp ON te.especialidade_id = esp.especialidade_id
                    WHERE te.terapeuta_info_id = ti.terapeuta_info_id
                ) as especialidades,
                (
                    SELECT json_agg(a.*)
                    FROM terapeuta_areas ta
                    JOIN areas_atuacao a ON ta.area_id = a.area_id
                    WHERE ta.terapeuta_info_id = ti.terapeuta_info_id
                ) as areas_atuacao,
                (
                    SELECT json_agg(json_build_object(
                        'rede_id', rs.rede_social_id,
                        'nome', rs.nome,
                        'url', trs.url
                    ))
                    FROM terapeuta_redes_sociais trs
                    JOIN redes_sociais rs ON trs.rede_social_id = rs.rede_social_id
                    WHERE trs.terapeuta_info_id = ti.terapeuta_info_id
                ) as redes_sociais
            FROM usuario u
            JOIN terapeuta_info ti ON u.usuario_id = ti.usuario_id
            LEFT JOIN profissoes p ON ti.profissao_id = p.profissao_id
            LEFT JOIN cidades c ON ti.cidade_id = c.cidade_id
            LEFT JOIN estados e ON ti.estado_id = e.estado_id
            LEFT JOIN paises pa ON ti.pais_id = pa.pais_id
            WHERE ti.terapeuta_info_id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Terapeuta não encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar terapeuta:', error);
        res.status(500).json({ message: 'Erro ao buscar terapeuta' });
    }
    },	

    getTerapeutaInfo: async (req, res) => {
        try {
            const { id } = req.params;

            const result = await pool.query(`
                SELECT 
                    t.*,
                    p.nome as profissao,
                    string_agg(DISTINCT e.nome, ', ') as especialidades,
                    string_agg(DISTINCT a.nome, ', ') as areas_atuacao
                FROM terapeuta_info t
                LEFT JOIN profissoes p ON t.profissao_id = p.profissao_id
                LEFT JOIN terapeuta_especialidades te ON t.terapeuta_info_id = te.terapeuta_info_id
                LEFT JOIN especialidades e ON te.especialidade_id = e.especialidade_id
                LEFT JOIN terapeuta_areas ta ON t.terapeuta_info_id = ta.terapeuta_info_id
                LEFT JOIN areas_atuacao a ON ta.area_id = a.area_id
                WHERE t.usuario_id = $1
                GROUP BY t.terapeuta_info_id, p.nome
            `, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Informações do terapeuta não encontradas' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Erro ao buscar informações do terapeuta:', error);
            res.status(500).json({ message: 'Erro ao buscar informações do terapeuta' });
        }
    },

    // Atualizar dados do terapeuta
    updateTerapeuta: async (req, res) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const { id } = req.params;
            const {
                profissao_id,
                registro_numero,
                registro_sigla,
                registro_validade,
                valor_sessao,
                tempo_sessao,
                modalidade_atendimento,
                especialidades,
                areas_atuacao
            } = req.body;

            // Atualiza informações básicas
            await client.query(`
                UPDATE terapeuta_info SET
                    profissao_id = $1,
                    registro_numero = $2,
                    registro_sigla = $3,
                    registro_validade = $4,
                    valor_sessao = $5,
                    tempo_sessao = $6,
                    modalidade_atendimento = $7
                WHERE terapeuta_info_id = $8
            `, [
                profissao_id,
                registro_numero,
                registro_sigla,
                registro_validade,
                valor_sessao,
                tempo_sessao,
                modalidade_atendimento,
                id
            ]);

            // Atualiza especialidades
            if (especialidades) {
                await client.query(
                    'DELETE FROM terapeuta_especialidades WHERE terapeuta_info_id = $1',
                    [id]
                );

                if (especialidades.length > 0) {
                    const especialidadesValues = especialidades.map(esp_id =>
                        `(${id}, ${esp_id})`
                    ).join(',');

                    await client.query(`
                        INSERT INTO terapeuta_especialidades (terapeuta_info_id, especialidade_id)
                        VALUES ${especialidadesValues}
                    `);
                }
            }

            // Atualiza áreas de atuação
            if (areas_atuacao) {
                await client.query(
                    'DELETE FROM terapeuta_areas WHERE terapeuta_info_id = $1',
                    [id]
                );

                if (areas_atuacao.length > 0) {
                    const areasValues = areas_atuacao.map(area_id =>
                        `(${id}, ${area_id})`
                    ).join(',');

                    await client.query(`
                        INSERT INTO terapeuta_areas (terapeuta_info_id, area_id)
                        VALUES ${areasValues}
                    `);
                }
            }

            await client.query('COMMIT');
            res.json({ message: 'Terapeuta atualizado com sucesso' });

        } catch (error) {
            await client.query('ROLLBACK');
            res.status(500).json({ error: error.message });
        } finally {
            client.release();
        }
    },

    // Desativar terapeuta (mantém como cliente)
    desativarTerapeuta: async (req, res) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const { id } = req.params;

            // Remove perfil de terapeuta
            const terapeutaInfo = await client.query(
                'SELECT usuario_id FROM terapeuta_info WHERE terapeuta_info_id = $1',
                [id]
            );

            if (terapeutaInfo.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ message: 'Terapeuta não encontrado' });
            }

            const perfilResult = await client.query(
                'SELECT perfil_id FROM perfil WHERE nome = $1',
                ['Terapeuta']
            );

            await client.query(
                'DELETE FROM usuario_perfil WHERE usuario_id = $1 AND perfil_id = $2',
                [terapeutaInfo.rows[0].usuario_id, perfilResult.rows[0].perfil_id]
            );

            // Não remove os dados da tabela terapeuta_info para manter histórico
            await client.query('COMMIT');
            res.json({ message: 'Terapeuta desativado com sucesso' });

        } catch (error) {
            await client.query('ROLLBACK');
            res.status(500).json({ error: error.message });
        } finally {
            client.release();
        }
    }
};

module.exports = terapeutaController;