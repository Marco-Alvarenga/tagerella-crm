// src/server/controllers/jogo.controller.js
const pool = require('../config/database');

const jogoController = {
    // Listar jogos com suas configurações
    getAllJogos: async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT 
                    j.jogo_id,
                    j.nome,
                    j.sort,
                    j.ativo,
                    jt.nome as tipo_jogo,
                    jc.numbers,
                    jc.numbers_color,
                    jc.n_imagens,
                    jc.background,
                    jc.coverimage,
                    jc.screensaver,
                    jc.animation_type,
                    jc.conteudo
                FROM jogo j
                JOIN jogo_tipo jt ON j.jogo_tipo_id = jt.jogo_tipo_id
                LEFT JOIN jogo_config jc ON j.jogo_id = jc.jogo_id
                ORDER BY j.sort
            `);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Criar novo jogo
    createJogo: async (req, res) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const {
                menu_id,
                tipo_id,
                nome,
                sort,
                config
            } = req.body;

            // 1. Inserir jogo
            const jogoResult = await client.query(
                'INSERT INTO jogo (menu_id, jogo_tipo_id, nome, sort) VALUES ($1, $2, $3, $4) RETURNING jogo_id',
                [menu_id, tipo_id, nome, sort]
            );
            const jogoId = jogoResult.rows[0].jogo_id;

            // 2. Inserir configuração
            if (config) {
                await client.query(
                    `INSERT INTO jogo_config (
                        jogo_id, 
                        numbers, 
                        numbers_color, 
                        n_imagens,
                        background,
                        coverimage,
                        screensaver,
                        animation_type,
                        conteudo
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                    [
                        jogoId,
                        config.numbers,
                        config.numbers_color,
                        config.n_imagens,
                        config.background,
                        config.coverimage,
                        config.screensaver,
                        config.animation_type,
                        JSON.stringify(config.conteudo)
                    ]
                );
            }

            await client.query('COMMIT');
            
            res.status(201).json({ 
                message: 'Jogo criado com sucesso',
                jogo_id: jogoId 
            });
        } catch (error) {
            await client.query('ROLLBACK');
            res.status(500).json({ error: error.message });
        } finally {
            client.release();
        }
    },

    // Atualizar jogo e suas configurações
    updateJogoConfig: async (req, res) => {
        console.log('Recebido pedido PUT para atualizar config de jogo:', req.params.id);
        console.log('Dados recebidos:', req.body);

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const { id } = req.params;
            const { 
                jogo_tipo_id,
                numbers,
                numbers_color,
                n_imagens,
                animation_type,
                screensaver,
                background,
                coverimage,
                conteudo
            } = req.body;

            // Verificar se o jogo existe na tabela jogo pelo menu_id
            let jogoResult = await client.query(
                'SELECT jogo_id FROM jogo WHERE menu_id = $1',
                [id]
            );

            let jogoId;

            // Se não existir, criar o jogo
            if (jogoResult.rows.length === 0) {
                console.log(`Jogo com menu_id ${id} não encontrado. Verificando se existe registro de menu.`);

                // Verificar se o menu existe
                const menuResult = await client.query(
                    'SELECT nome, ordem FROM menu WHERE menu_id = $1',
                    [id]
                );

                if (menuResult.rows.length === 0) {
                    throw new Error(`Menu com ID ${id} não encontrado`);
                }

                const { nome, ordem } = menuResult.rows[0];

                console.log(`Criando novo registro de jogo para menu "${nome}"`);
                const novoJogoResult = await client.query(
                    'INSERT INTO jogo (menu_id, jogo_tipo_id, nome, sort) VALUES ($1, $2, $3, $4) RETURNING jogo_id',
                    [id, jogo_tipo_id, nome, ordem]
                );
                jogoId = novoJogoResult.rows[0].jogo_id;
                console.log(`Novo jogo criado com jogo_id ${jogoId}`);
            } else {
                jogoId = jogoResult.rows[0].jogo_id;
                console.log(`Jogo encontrado com jogo_id ${jogoId}`);

                // Atualizar o tipo do jogo
                await client.query(
                    'UPDATE jogo SET jogo_tipo_id = $1 WHERE jogo_id = $2',
                    [jogo_tipo_id, jogoId]
                );
            }

            // Tratar o conteudo para PostgreSQL
            let conteudoFormatado = null;
            if (Array.isArray(conteudo)) {
                // Transformar o array em uma string JSON escapada para o PostgreSQL
                conteudoFormatado = JSON.stringify(conteudo);
                console.log('conteudoFormatado para o banco:', conteudoFormatado);
            }

            // Verificar se já existe configuração
            const configExists = await client.query(
                'SELECT 1 FROM jogo_config WHERE jogo_id = $1',
                [jogoId]
            );

                console.log('Configuração existente:', configExists.rows[0]);

            if (configExists.rows.length > 0) {
                console.log('Valor do conteudo antes da atualização:', configExists.rows[0].conteudo);
                console.log('Novo valor de conteudo a ser salvo:', conteudo);
                await client.query(`
                UPDATE jogo_config SET
                    numbers = $1,
                    numbers_color = $2,
                    n_imagens = $3,
                    animation_type = $4,
                    screensaver = $5,
                    background = $6,
                    coverimage = $7,
                    conteudo = $8,
                    updated_at = CURRENT_TIMESTAMP
                WHERE jogo_id = $9
                `, [
                    numbers,
                    numbers_color,
                    n_imagens,
                    animation_type,
                    screensaver,
                    background,
                    coverimage,
                    conteudoFormatado,
                    jogoId
                ]);
            } else {
                console.log(`Criando nova configuração para jogo_id ${jogoId}`);
                await client.query(`
                INSERT INTO jogo_config (
                    jogo_id,
                    numbers,
                    numbers_color,
                    n_imagens,
                    animation_type,
                    screensaver,
                    background,
                    coverimage,
                    conteudo
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                `, [
                    jogoId,
                    numbers,
                    numbers_color,
                    n_imagens,
                    animation_type,
                    screensaver,
                    background,
                    coverimage,
                    conteudoFormatado
                ]);
            }

            await client.query('COMMIT');
            console.log(`Configuração salva com sucesso para jogo_id ${jogoId}`);
            res.json({ success: true, jogo_id: jogoId });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erro detalhado ao atualizar:', error);
            res.status(500).json({ message: error.message });
        } finally {
            client.release();
        }
    },

    // Desativar jogo (soft delete)
    deleteJogo: async (req, res) => {
        try {
            const { id } = req.params;
            await pool.query(
                'UPDATE jogo SET ativo = false WHERE jogo_id = $1',
                [id]
            );
            res.json({ message: 'Jogo desativado com sucesso' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
	
	getJogoConfig: async (req, res) => {
		try {
                      console.log('Buscando configuração para o ID:', req.params.id);

			const result = await pool.query(`
			SELECT 
				j.jogo_id,
				j.menu_id,
				j.jogo_tipo_id,
				jt.nome as tipo_jogo_nome,
				jc.numbers,
				jc.numbers_color,
				jc.n_imagens,
				jc.animation_type,
				jc.screensaver,
				jc.background,
				jc.coverimage,
				jc.conteudo
			FROM jogo j
			JOIN jogo_tipo jt ON j.jogo_tipo_id = jt.jogo_tipo_id
			LEFT JOIN jogo_config jc ON j.jogo_id = jc.jogo_id
			WHERE j.menu_id = $1
			`, [req.params.id]);

                 if (result.rows.length === 0) {
                       console.log('Nenhuma configuração encontrada para o menu_id:', req.params.id);
                       return res.json({}); // Retornar objeto vazio em vez de status 404
                }

			console.log('Configuração encontrada:', result.rows[0]); // Debug
			res.json(result.rows[0]);
		} catch (error) {
			console.error('Erro ao buscar configuração do jogo:', error);
			res.status(500).json({ message: error.message });
		}
	},
	
	getJogoImages: async (req, res) => {
		try {
		const result = await pool.query(`
			SELECT jc.conteudo
			FROM jogo j
			JOIN jogo_config jc ON j.jogo_id = jc.jogo_id
			WHERE j.menu_id = $1
		`, [req.params.id]);
		
		const images = result.rows[0]?.conteudo || [];
		res.json(images);
		} catch (error) {
		console.error('Erro ao buscar imagens:', error);
		res.status(500).json({ message: error.message });
		}
	},	
	
	createJogoConfig: async (req, res) => {
		const client = await pool.connect();
		try {
			await client.query('BEGIN');
			const { menu_id, ...config } = req.body;
		
			const configExists = await client.query(
			'SELECT 1 FROM jogo_config WHERE jogo_id = $1',
			[menu_id]
			);
		
			if (configExists.rows.length > 0) {
			await client.query(`
				UPDATE jogo_config SET
				tipojogo = $1,
				numbers = $2, 
				numberscolor = $3,
				screensaver = $4,
				background = $5,
				coverimage = $6,
				animationtype = $7
				WHERE jogo_id = $8
			`, [
				config.tipojogo,
				config.numbers,
				config.numberscolor,
				config.screensaver,
				config.background,
				config.coverimage, 
				config.animationtype,
				menu_id
			]);
			} else {
			await client.query(`
				INSERT INTO jogo_config (
				tipojogo, numbers, numberscolor,
				screensaver, background, coverimage,
				animationtype, jogo_id
				) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
			`, [
				config.tipojogo,
				config.numbers,
				config.numberscolor,
				config.screensaver,
				config.background,
				config.coverimage,
				config.animationtype,
				menu_id
			]);
			}
		
			await client.query('COMMIT');
			res.json({ message: 'Configuração salva com sucesso' });
		} catch (error) {
			await client.query('ROLLBACK');
			res.status(500).json({ message: error.message });
		} finally {
			client.release();
		}
	},

	initializeJogoConfig: async (req, res) => {
		const client = await pool.connect();
		try {
		await client.query('BEGIN');
		const { menu_id, tipo_jogo } = req.body;
		
		await client.query(
			'INSERT INTO jogo_config (jogo_id, tipo_jogo) VALUES ($1, $2)',
			[menu_id, tipo_jogo]
		);
		
		await client.query('COMMIT');
		res.json({ success: true });
		} catch (error) {
		await client.query('ROLLBACK');
		res.status(500).json({ error: error.message });
		} finally {
		client.release();
		}
	},
	
	checkJogoConfig: async (req, res) => {
		try {
		const result = await pool.query('SELECT 1 FROM jogo_config WHERE jogo_id = $1', [req.params.id]);
		res.json({ hasConfig: result.rows.length > 0 });
		} catch (error) {
		res.status(500).json({ error: error.message });
		}
	}	
	
};

module.exports = jogoController;
