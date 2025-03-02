// src/server/controllers/terapeuta-documentos.controller.js
const pool = require('../config/database');
const { uploadDocumentos } = require('../config/multer.config');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink); // Converte fs.unlink para promise

const terapeutaDocumentosController = {
    // Upload de documento
    uploadDocumento: async (req, res) => {
        const client = await pool.connect();
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'Nenhum arquivo enviado' });
            }

            const { terapeuta_info_id } = req.params;
            const { tipo, descricao } = req.body;

			if (!tipo) {
				return res.status(400).json({ message: 'O tipo do documento é obrigatório' });
			}
	
			// Verifica se o terapeuta existe
			const terapeutaExists = await client.query(
				'SELECT terapeuta_info_id FROM terapeuta_info WHERE terapeuta_info_id = $1',
				[terapeuta_info_id]
			);
	
			if (terapeutaExists.rows.length === 0) {
				return res.status(404).json({ message: 'Terapeuta não encontrado' });
			}

            await client.query('BEGIN');

            // Registra documento no banco
            const result = await client.query(`
                INSERT INTO terapeuta_documentos (
                    terapeuta_info_id,
                    tipo,
                    descricao,
                    arquivo_url,
                    data_upload
                ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
                RETURNING documento_id
            `, [
                terapeuta_info_id,
                tipo,
                descricao,
                `/uploads/documentos/${terapeuta_info_id}/${req.file.filename}`
            ]);

            // Registra na auditoria
            await client.query(`
                INSERT INTO audit_log (
                    usuario_id,
                    acao,
                    tabela,
                    registro_id,
                    dados_novos
                ) VALUES ($1, 'upload_documento', 'terapeuta_documentos', $2, $3)
            `, [
                req.user.usuario_id,
                result.rows[0].documento_id,
                JSON.stringify({
                    tipo,
                    descricao,
                    arquivo: req.file.filename
                })
            ]);

            await client.query('COMMIT');

            res.status(201).json({
                message: 'Documento enviado com sucesso',
                documento_id: result.rows[0].documento_id
            });

        } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro no upload:', error);
        
        // Remove arquivo em caso de erro
        if (req.file) {
            await fs.unlink(req.file.path).catch(console.error);
        }
        
        res.status(500).json({ 
            message: 'Erro ao fazer upload do documento',
            error: error.message 
        });
		} finally {
			client.release();
		}
    },

    // Listar documentos
    listarDocumentos: async (req, res) => {
        try {
            const { terapeuta_info_id } = req.params;
            
            const result = await pool.query(`
                SELECT 
                    documento_id,
                    tipo,
                    descricao,
                    arquivo_url,
                    data_upload,
					CASE 
						WHEN arquivo_url LIKE '%.pdf' THEN 'application/pdf'
						WHEN arquivo_url LIKE '%.jpg' OR arquivo_url LIKE '%.jpeg' THEN 'image/jpeg'
						WHEN arquivo_url LIKE '%.png' THEN 'image/png'
						ELSE 'application/octet-stream'
					END as mime_type					
                FROM terapeuta_documentos
                WHERE terapeuta_info_id = $1
                ORDER BY data_upload DESC
            `, [terapeuta_info_id]);

            res.json(result.rows);
        } catch (error) {
			console.error('Erro ao listar documentos:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // Buscar documento específico
    getDocumento: async (req, res) => {
        try {
            const { documento_id } = req.params;

			const result = await pool.query(
				'SELECT arquivo_url, tipo FROM terapeuta_documentos WHERE documento_id = $1',
				[documento_id]
			);

			if (result.rows.length === 0) {
				return res.status(404).json({ message: 'Documento não encontrado' });
			}
	
			const documento = result.rows[0];
			const filePath = path.join(__dirname, '../../../', documento.arquivo_url);
	
			res.download(filePath);
		} catch (error) {
			console.error('Erro ao baixar documento:', error);
			res.status(500).json({ error: 'Erro ao baixar documento' });
		}
    },

    // Atualizar informações do documento
    updateDocumento: async (req, res) => {
        const client = await pool.connect();
        try {
            const { documento_id } = req.params;
            const { tipo, descricao } = req.body;

            await client.query('BEGIN');

            const oldDoc = await client.query(
                'SELECT * FROM terapeuta_documentos WHERE documento_id = $1',
                [documento_id]
            );

            if (oldDoc.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ message: 'Documento não encontrado' });
            }

            const result = await client.query(`
                UPDATE terapeuta_documentos
                SET tipo = $1, descricao = $2
                WHERE documento_id = $3
                RETURNING *
            `, [tipo, descricao, documento_id]);

            // Registra na auditoria
            await client.query(`
                INSERT INTO audit_log (
                    usuario_id,
                    acao,
                    tabela,
                    registro_id,
                    dados_antigos,
                    dados_novos
                ) VALUES ($1, 'update_documento', 'terapeuta_documentos', $2, $3, $4)
            `, [
                req.user.usuario_id,
                documento_id,
                JSON.stringify(oldDoc.rows[0]),
                JSON.stringify(result.rows[0])
            ]);

            await client.query('COMMIT');
            res.json({
                message: 'Documento atualizado com sucesso',
                documento: result.rows[0]
            });

        } catch (error) {
            await client.query('ROLLBACK');
            res.status(500).json({ error: error.message });
        } finally {
            client.release();
        }
    },

    // Excluir documento
    deleteDocumento: async (req, res) => {
        const client = await pool.connect();
        try {
            const { documento_id } = req.params;

            await client.query('BEGIN');

            // Busca informações do documento antes de excluir
			const docResult = await client.query(
				'SELECT arquivo_url, terapeuta_info_id FROM terapeuta_documentos WHERE documento_id = $1',
				[documento_id]
			);

            if (docResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ message: 'Documento não encontrado' });
            }

            const documento = docResult.rows[0];

            // Remove o arquivo físico
			try {
				// Ajusta o caminho para remover a barra inicial se existir
				const arquivoUrl = documento.arquivo_url.startsWith('/') 
					? documento.arquivo_url.substring(1) 
					: documento.arquivo_url;
					
				const filePath = path.join(__dirname, '../../../', arquivoUrl);
				
				// Log para debug
				console.log('Tentando remover arquivo:', filePath);
				
				await unlinkAsync(filePath);
				console.log('Arquivo removido com sucesso');
			} catch (err) {
				console.error('Erro ao remover arquivo físico:', err);
				// Continua mesmo se não conseguir remover o arquivo
			}

            // Remove registro do banco
            await client.query(
                'DELETE FROM terapeuta_documentos WHERE documento_id = $1',
                [documento_id]
            );

            // Registra na auditoria
            await client.query(`
                INSERT INTO audit_log (
                    usuario_id,
                    acao,
                    tabela,
                    registro_id,
                    dados_antigos
                ) VALUES ($1, 'delete_documento', 'terapeuta_documentos', $2, $3)
            `, [
                req.user.usuario_id,
                documento_id,
                JSON.stringify(documento)
            ]);

			await client.query('COMMIT');
			res.json({ message: 'Documento excluído com sucesso' });
		} catch (error) {
			await client.query('ROLLBACK');
			console.error('Erro ao excluir documento:', error);
			res.status(500).json({ 
				error: 'Erro ao excluir documento',
				details: error.message
			});
		} finally {
			client.release();
		}
    }
};

// Exporta o controller e o middleware de upload
module.exports = {
    ...terapeutaDocumentosController,
    upload: uploadDocumentos
};