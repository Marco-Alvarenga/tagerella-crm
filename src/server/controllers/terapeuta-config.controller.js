// src/server/controllers/terapeuta-config.controller.js
const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        // Define o diretório baseado no tipo de arquivo
        let uploadDir;
        if (file.fieldname === 'foto') {
            uploadDir = path.join(__dirname, '../../../uploads/fotos', req.params.terapeuta_info_id);
        } else if (file.fieldname === 'assinatura') {
            uploadDir = path.join(__dirname, '../../../uploads/assinaturas', req.params.terapeuta_info_id);
        }

        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            cb(new Error('Apenas imagens são permitidas'));
            return;
        }
        cb(null, true);
    }
});

const terapeutaConfigController = {
    // Atualizar informações financeiras
    updateInfoFinanceira: async (req, res) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const { terapeuta_info_id } = req.params;
            const {
                valor_sessao,
                moeda,
                tempo_sessao,
                pix,
                banco,
                agencia,
                conta
            } = req.body;

            const result = await client.query(`
                UPDATE terapeuta_info SET
                    valor_sessao = $1,
                    moeda = $2,
                    tempo_sessao = $3,
                    pix = $4,
                    banco = $5,
                    agencia = $6,
                    conta = $7
                WHERE terapeuta_info_id = $8
                RETURNING *
            `, [
                valor_sessao,
                moeda,
                tempo_sessao,
                pix,
                banco,
                agencia,
                conta,
                terapeuta_info_id
            ]);

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ message: 'Terapeuta não encontrado' });
            }

            await client.query('COMMIT');
            res.json({
                message: 'Informações financeiras atualizadas com sucesso',
                dados: result.rows[0]
            });

        } catch (error) {
            await client.query('ROLLBACK');
            res.status(500).json({ error: error.message });
        } finally {
            client.release();
        }
    },

    // Atualizar informações profissionais
    updateInfoProfissional: async (req, res) => {
        const client = await pool.connect();
        try {
        await client.query('BEGIN');

        const { terapeuta_info_id } = req.params;
        const {
            profissao_id,
            registro_numero,
            registro_sigla,
            registro_validade,
            universidade,
            experiencia,
            descricao,
            modalidade_atendimento,
            especialidades, // Array de IDs
            areas_atuacao,  // Array de IDs
            redes_sociais  // Array de objetos {rede_id, url}
        } = req.body;

        // 1. Atualiza informações básicas
        const resultInfo = await client.query(`
            UPDATE terapeuta_info SET
                profissao_id = $1,
                registro_numero = $2,
                registro_sigla = $3,
                registro_validade = $4,
                universidade = $5,
                experiencia = $6,
                descricao = $7,
                modalidade_atendimento = $8,
                updated_at = CURRENT_TIMESTAMP
            WHERE terapeuta_info_id = $9
            RETURNING *
        `, [
            profissao_id,
            registro_numero,
            registro_sigla,
            registro_validade,
            universidade,
            experiencia,
            descricao,
            modalidade_atendimento,
            terapeuta_info_id
        ]);

        // 2. Atualiza especialidades
        if (especialidades) {
            // Remove antigas
            await client.query(
                'DELETE FROM terapeuta_especialidades WHERE terapeuta_info_id = $1',
                [terapeuta_info_id]
            );

            // Insere novas
            if (especialidades.length > 0) {
                const especialidadesValues = especialidades
                    .map((esp_id, idx) => `($1, $${idx + 2})`)
                    .join(',');
                
                await client.query(`
                    INSERT INTO terapeuta_especialidades (terapeuta_info_id, especialidade_id)
                    VALUES ${especialidadesValues}
                `, [terapeuta_info_id, ...especialidades]);
            }
        }

        // 3. Atualiza áreas de atuação
        if (areas_atuacao) {
            await client.query(
                'DELETE FROM terapeuta_areas WHERE terapeuta_info_id = $1',
                [terapeuta_info_id]
            );

            if (areas_atuacao.length > 0) {
                const areasValues = areas_atuacao
                    .map((area_id, idx) => `($1, $${idx + 2})`)
                    .join(',');
                
                await client.query(`
                    INSERT INTO terapeuta_areas (terapeuta_info_id, area_id)
                    VALUES ${areasValues}
                `, [terapeuta_info_id, ...areas_atuacao]);
            }
        }

        // 4. Atualiza redes sociais
        if (redes_sociais) {
            await client.query(
                'DELETE FROM terapeuta_redes_sociais WHERE terapeuta_info_id = $1',
                [terapeuta_info_id]
            );

            if (redes_sociais.length > 0) {
                const redesValues = redes_sociais
                    .map((_, idx) => `($1, $${idx*2 + 2}, $${idx*2 + 3})`)
                    .join(',');
                
                const redesParams = redes_sociais.reduce((acc, rede) => [
                    ...acc, 
                    rede.rede_id, 
                    rede.url
                ], [terapeuta_info_id]);

                await client.query(`
                    INSERT INTO terapeuta_redes_sociais (terapeuta_info_id, rede_social_id, url)
                    VALUES ${redesValues}
                `, redesParams);
            }
        }

        await client.query('COMMIT');
        
        // Retorna dados atualizados
        const response = {
            message: 'Informações profissionais atualizadas com sucesso',
            dados: {
                ...resultInfo.rows[0],
                especialidades,
                areas_atuacao,
                redes_sociais
            }
        };

        res.json(response);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao atualizar informações:', error);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
    },

    // Buscar profissões
    getProfissoes: async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT profissao_id, nome, descricao
                FROM profissoes
                WHERE ativo = true
                ORDER BY nome
            `);

            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Buscar especialidades
    getEspecialidades: async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT especialidade_id, nome, descricao
                FROM especialidades
                WHERE ativo = true
                ORDER BY nome
            `);

            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Buscar áreas de atuação
    getAreasAtuacao: async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT area_id, nome, descricao
                FROM areas_atuacao
                WHERE ativo = true
                ORDER BY nome
            `);

            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Atualizar foto do perfil
    updateFotoPerfil: async (req, res) => {
        const client = await pool.connect();
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'Nenhuma foto enviada' });
            }

            const { terapeuta_info_id } = req.params;
            const fotoUrl = `/uploads/fotos/${terapeuta_info_id}/${req.file.filename}`;

            await client.query('BEGIN');

            // Busca foto antiga para excluir
            const oldResult = await client.query(
                'SELECT foto_url FROM terapeuta_info WHERE terapeuta_info_id = $1',
                [terapeuta_info_id]
            );

            // Atualiza URL da foto
            const result = await client.query(`
                UPDATE terapeuta_info
                SET foto_url = $1
                WHERE terapeuta_info_id = $2
                RETURNING *
            `, [fotoUrl, terapeuta_info_id]);

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ message: 'Terapeuta não encontrado' });
            }

            // Remove foto antiga se existir
            if (oldResult.rows[0]?.foto_url) {
                const oldPath = path.join(__dirname, '../../../', oldResult.rows[0].foto_url);
                await fs.unlink(oldPath).catch(() => {});
            }

            await client.query('COMMIT');
            res.json({
                message: 'Foto atualizada com sucesso',
                foto_url: fotoUrl
            });

        } catch (error) {
            await client.query('ROLLBACK');
            // Remove nova foto em caso de erro
            if (req.file) {
                await fs.unlink(req.file.path).catch(() => {});
            }
            res.status(500).json({ error: error.message });
        } finally {
            client.release();
        }
    },

    // Atualizar assinatura
    updateAssinatura: async (req, res) => {
        const client = await pool.connect();
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'Nenhuma assinatura enviada' });
            }

            const { terapeuta_info_id } = req.params;
            const assinaturaUrl = `/uploads/assinaturas/${terapeuta_info_id}/${req.file.filename}`;

            await client.query('BEGIN');

            // Busca assinatura antiga para excluir
            const oldResult = await client.query(
                'SELECT assinatura_url FROM terapeuta_info WHERE terapeuta_info_id = $1',
                [terapeuta_info_id]
            );

            // Atualiza URL da assinatura
            const result = await client.query(`
                UPDATE terapeuta_info
                SET assinatura_url = $1
                WHERE terapeuta_info_id = $2
                RETURNING *
            `, [assinaturaUrl, terapeuta_info_id]);

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ message: 'Terapeuta não encontrado' });
            }

            // Remove assinatura antiga se existir
            if (oldResult.rows[0]?.assinatura_url) {
                const oldPath = path.join(__dirname, '../../../', oldResult.rows[0].assinatura_url);
                await fs.unlink(oldPath).catch(() => {});
            }

            await client.query('COMMIT');
            res.json({
                message: 'Assinatura atualizada com sucesso',
                assinatura_url: assinaturaUrl
            });

        } catch (error) {
            await client.query('ROLLBACK');
            // Remove nova assinatura em caso de erro
            if (req.file) {
                await fs.unlink(req.file.path).catch(() => {});
            }
            res.status(500).json({ error: error.message });
        } finally {
            client.release();
        }
    }
};

module.exports = {
    ...terapeutaConfigController,
    upload
};