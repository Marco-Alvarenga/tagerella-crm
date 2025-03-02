// src/server/controllers/menu.controller.js
const pool = require('../config/database');

const menuController = {
    // Obter estrutura completa do menu
	getMenuStructure: async (req, res) => {
		try {
		const result = await pool.query(`
			SELECT menu_id, nome, ordem, tipo, ativo
			FROM menu 
			WHERE origem = 'jogos'
			ORDER BY menu_superior_id NULLS FIRST, ordem
		`);
		res.json(result.rows);
		} catch (error) {
		res.status(500).json({ message: error.message });
		}
	},
		
	getMenuChildren: async (req, res) => {
		try {
			const { parentId } = req.params;
			const result = await pool.query(`
				SELECT menu_id, nome, menu_superior_id, ordem, tipo, ativo
				FROM menu 
				WHERE origem = 'jogos'
				AND menu_superior_id ${parentId === 'root' ? 'IS NULL' : '= $1'}
				ORDER BY ordem
			`, parentId === 'root' ? [] : [parentId]);
			
			console.log('Menus encontrados:', result.rows);
			res.json(result.rows);
		} catch (error) {
			console.error('Erro:', error);
			res.status(500).json({ message: error.message });
		}
	},

    // Criar novo item no menu
	createMenuItem: async (req, res) => {
		const client = await pool.connect();
		try {
			await client.query('BEGIN');
			const { nome, ordem, tipo, menu_superior_id } = req.body;
			
			// 1. Criar menu
			const menuResult = await client.query(
			'INSERT INTO menu (nome, ordem, tipo, menu_superior_id, origem) VALUES ($1, $2, $3, $4, $5) RETURNING menu_id',
			[nome, ordem, tipo, menu_superior_id, 'jogos']
			);
			const menuId = menuResult.rows[0].menu_id;
		
			// 2. Se for jogo, criar entrada na tabela jogo
			if (tipo === 'jogo') {
			const jogoResult = await client.query(
				'INSERT INTO jogo (menu_id, jogo_tipo_id, nome, sort) VALUES ($1, $2, $3, $4) RETURNING jogo_id',
				[menuId, 1, nome, ordem] // Assumindo 1 como ID para tipo 'cartas'
			);
		
			// 3. Criar configuração do jogo
			await client.query(
				'INSERT INTO jogo_config (jogo_id) VALUES ($1)',
				[jogoResult.rows[0].jogo_id]
			);
			}
		
			await client.query('COMMIT');
			res.status(201).json(menuResult.rows[0]);
		} catch (error) {
			await client.query('ROLLBACK');
			console.error('Erro detalhado:', error);
			res.status(500).json({ message: error.message });
		} finally {
			client.release();
		}
	},

    // Atualizar item do menu
    updateMenuItem: async (req, res) => {
		const client = await pool.connect();
		try {
		await client.query('BEGIN');
		const { id } = req.params;
		const { nome, ordem, tipo } = req.body;
	
		await client.query(
			'UPDATE menu SET nome = $1, ordem = $2, tipo = $3 WHERE menu_id = $4',
			[nome, ordem, tipo, id]
		);
	
		if (tipo === 'jogo') {
			const configExists = await client.query(
			'SELECT 1 FROM jogo_config WHERE jogo_id = $1',
			[id]
			);
			
			if (!configExists.rows.length) {
			await client.query(
				'INSERT INTO jogo_config (jogo_id, tipo_jogo) VALUES ($1, $2)',
				[id, 'cartas']
			);
			}
		}
	
		await client.query('COMMIT');
		res.json({ message: 'Menu atualizado com sucesso' });
		} catch (error) {
		await client.query('ROLLBACK');
		res.status(500).json({ message: error.message });
		} finally {
		client.release();
		}
    },

    // Desativar item do menu
	deleteMenuItem: async (req, res) => {
		try {
			const { id } = req.params
			await pool.query('UPDATE menu SET ativo = false WHERE menu_id = $1', [id])
			res.json({ message: 'Menu desativado com sucesso' })
		} catch (error) {
			res.status(500).json({ message: error.message })
		}
	},

	permanentDeleteMenuItem: async (req, res) => {
		const client = await pool.connect()
		try {
			await client.query('BEGIN')
			await client.query('DELETE FROM menu WHERE menu_id = $1', [req.params.id])
			await client.query('COMMIT')
			res.json({ message: 'Menu excluído permanentemente' })
		} catch (error) {
			await client.query('ROLLBACK')
			res.status(500).json({ message: error.message })
		} finally {
			client.release()
		}
	},

	reactivateMenuItem: async (req, res) => {
		try {
			const { id } = req.params
			await pool.query('UPDATE menu SET ativo = true WHERE menu_id = $1', [id])
			res.json({ message: 'Menu reativado com sucesso' })
		} catch (error) {
			res.status(500).json({ message: error.message })
		}
	}
	
};

module.exports = menuController;