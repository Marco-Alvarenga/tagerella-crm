// src/server/controllers/client.controller.js
const pool = require('../config/database');
const bcrypt = require('bcrypt');

const registrarAuditoria = async (client, usuarioId, acao, tabela, registroId, dadosAntigos = null, dadosNovos = null, ipAddress) => {
    try {
        await client.query(`
            INSERT INTO audit_log (
                usuario_id, acao, tabela, registro_id, 
                dados_antigos, dados_novos, ip_address
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [usuarioId, acao, tabela, registroId, dadosAntigos, dadosNovos, ipAddress]);
    } catch (error) {
        console.error('Erro ao registrar auditoria:', error);
    }
};

// Função para validar email único
const validarEmailUnico = async (email, usuarioId = null) => {
    const query = usuarioId 
        ? 'SELECT 1 FROM usuario WHERE email = $1 AND usuario_id != $2'
        : 'SELECT 1 FROM usuario WHERE email = $1';
    const params = usuarioId ? [email, usuarioId] : [email];
    
    const result = await pool.query(query, params);
    return result.rows.length === 0;
};

const clientController = {
   // Get all clients
   getAllClients: async (req, res) => {
        try {
            const { 
                page = 1, 
                limit = 10, 
                sortBy = 'nome', 
                order = 'ASC',
                search = '',
                status = 'all'
            } = req.query;
            
            const offset = (page - 1) * limit;
            
            // Construir query base
            let query = `
                SELECT 
                    u.usuario_id,
                    u.nome,
                    u.email,
                    u.ativo,
                    ci.telefone,
                    ci.nome_paciente,
                    ci.responsavel,
                    COUNT(*) OVER() as total_count
                FROM usuario u
                JOIN cliente_info ci ON u.usuario_id = ci.usuario_id
                JOIN usuario_perfil up ON u.usuario_id = up.usuario_id
                JOIN perfil p ON up.perfil_id = p.perfil_id
                WHERE p.nome = 'Cliente'
            `;

            const queryParams = [];
            let paramCount = 1;

            // Adicionar filtro de busca
            if (search) {
                query += ` AND (u.nome ILIKE $${paramCount} OR u.email ILIKE $${paramCount} OR ci.telefone ILIKE $${paramCount})`;
                queryParams.push(`%${search}%`);
                paramCount++;
            }

            // Adicionar filtro de status
            if (status !== 'all') {
                query += ` AND u.ativo = $${paramCount}`;
                queryParams.push(status === 'active');
                paramCount++;
            }

            // Adicionar ordenação e paginação
            query += ` ORDER BY ${sortBy} ${order} LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
            queryParams.push(limit, offset);

            const result = await pool.query(query, queryParams);
            
            const totalCount = result.rows[0]?.total_count || 0;

            res.json({
                data: result.rows,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / limit),
                    totalItems: parseInt(totalCount),
                    itemsPerPage: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
            res.status(500).json({ error: error.message });
        }
   },

   // Get client by ID
   getClientById: async (req, res) => {
       try {
           const { id } = req.params;
           const result = await pool.query(`
               SELECT 
                   u.usuario_id,
                   u.nome,
                   u.email,
                   u.ativo,
                   ci.telefone,
                   ci.nome_paciente,
                   ci.responsavel
               FROM usuario u
               JOIN cliente_info ci ON u.usuario_id = ci.usuario_id
               JOIN usuario_perfil up ON u.usuario_id = up.usuario_id
               JOIN perfil p ON up.perfil_id = p.perfil_id
               WHERE u.usuario_id = $1 AND p.nome = 'Cliente'
           `, [id]);

           if (result.rows.length === 0) {
               return res.status(404).json({ message: 'Cliente não encontrado' });
           }

           res.json(result.rows[0]);
       } catch (error) {
           res.status(500).json({ error: error.message });
       }
   },

    // Create new client com validações melhoradas
    createClient: async (req, res) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const { nome, email, senha, telefone, nome_paciente, responsavel } = req.body;
            
            // Validações
            if (!nome || !email || !senha) {
                throw new Error('Campos obrigatórios faltando');
            }

            // Validar email
            const emailUnico = await validarEmailUnico(email);
            if (!emailUnico) {
                throw new Error('Email já cadastrado');
            }

            // Gerar hash da senha
            const hash = await bcrypt.hash(senha, 10);

            // Criar usuário base
            const userResult = await client.query(
                'INSERT INTO usuario (nome, email, senha, ativo) VALUES ($1, $2, $3, true) RETURNING usuario_id',
                [nome, email, hash]
            );
            const usuarioId = userResult.rows[0].usuario_id;

            // Criar informações do cliente
            await client.query(
                'INSERT INTO cliente_info (usuario_id, telefone, nome_paciente, responsavel) VALUES ($1, $2, $3, $4)',
                [usuarioId, telefone, nome_paciente, responsavel]
            );

            // Buscar e associar perfil
            const perfilResult = await client.query(
                'SELECT perfil_id FROM perfil WHERE nome = $1',
                ['Cliente']
            );
            const perfilId = perfilResult.rows[0].perfil_id;

            await client.query(
                'INSERT INTO usuario_perfil (usuario_id, perfil_id) VALUES ($1, $2)',
                [usuarioId, perfilId]
            );

            // Registrar auditoria
            await registrarAuditoria(
                client,
                req.user?.id, // ID do usuário que está fazendo a ação
                'CREATE',
                'cliente',
                usuarioId,
                null,
                { nome, email, telefone, nome_paciente, responsavel },
                req.ip
            );

            await client.query('COMMIT');

            res.status(201).json({ 
                message: 'Cliente criado com sucesso',
                usuario_id: usuarioId 
            });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erro ao criar cliente:', error);
            res.status(error.message.includes('Email já cadastrado') ? 400 : 500)
               .json({ error: error.message });
        } finally {
            client.release();
        }
   },

   // Update client
   updateClient: async (req, res) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const { id } = req.params;
            const { nome, email, telefone, nome_paciente, responsavel } = req.body;

            // Validações
            if (!nome || !email) {
                throw new Error('Campos obrigatórios faltando');
            }

            // Buscar dados antigos para auditoria
            const dadosAntigos = await client.query(`
                SELECT 
                    u.nome, u.email,
                    ci.telefone, ci.nome_paciente, ci.responsavel
                FROM usuario u
                JOIN cliente_info ci ON u.usuario_id = ci.usuario_id
                WHERE u.usuario_id = $1
            `, [id]);

            if (dadosAntigos.rows.length === 0) {
                throw new Error('Cliente não encontrado');
            }

            // Validar email se foi alterado
            if (email !== dadosAntigos.rows[0].email) {
                const emailUnico = await validarEmailUnico(email, id);
                if (!emailUnico) {
                    throw new Error('Email já cadastrado');
                }
            }

            // Atualizar usuário base
            await client.query(
                'UPDATE usuario SET nome = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE usuario_id = $3',
                [nome, email, id]
            );

            // Atualizar informações do cliente
            await client.query(
                'UPDATE cliente_info SET telefone = $1, nome_paciente = $2, responsavel = $3 WHERE usuario_id = $4',
                [telefone, nome_paciente, responsavel, id]
            );

            // Registrar auditoria
            await registrarAuditoria(
                client,
                req.user?.id,
                'UPDATE',
                'cliente',
                id,
                dadosAntigos.rows[0],
                { nome, email, telefone, nome_paciente, responsavel },
                req.ip
            );

            await client.query('COMMIT');
            res.json({ 
                message: 'Cliente atualizado com sucesso',
                usuario_id: id
            });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erro ao atualizar cliente:', error);
            res.status(error.message.includes('já cadastrado') ? 400 : 500)
               .json({ error: error.message });
        } finally {
            client.release();
        }
   },

   // Delete client (soft delete)
   deleteClient: async (req, res) => {
       const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const { id } = req.params;
            
            // Buscar dados para auditoria
            const dadosAntigos = await client.query(
                'SELECT nome, email, ativo FROM usuario WHERE usuario_id = $1',
                [id]
            );

            if (dadosAntigos.rows.length === 0) {
                throw new Error('Cliente não encontrado');
            }

            // Desativar o usuário
            await client.query(
                'UPDATE usuario SET ativo = false, updated_at = CURRENT_TIMESTAMP WHERE usuario_id = $1',
                [id]
            );

            // Registrar auditoria
            await registrarAuditoria(
                client,
                req.user?.id,
                'DELETE',
                'cliente',
                id,
                dadosAntigos.rows[0],
                { ...dadosAntigos.rows[0], ativo: false },
                req.ip
            );

            await client.query('COMMIT');
            res.json({ message: 'Cliente desativado com sucesso' });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erro ao desativar cliente:', error);
            res.status(500).json({ error: error.message });
        } finally {
            client.release();
        }
   },
   
   // Reativar client
	reactivateClient: async (req, res) => {
	const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const { id } = req.params;

            // Buscar dados para auditoria
            const dadosAntigos = await client.query(
                'SELECT nome, email, ativo FROM usuario WHERE usuario_id = $1',
                [id]
            );

            if (dadosAntigos.rows.length === 0) {
                throw new Error('Cliente não encontrado');
            }
            
            await client.query(
                'UPDATE usuario SET ativo = true, updated_at = CURRENT_TIMESTAMP WHERE usuario_id = $1',
                [id]
            );

            // Registrar auditoria
            await registrarAuditoria(
                client,
                req.user?.id,
                'REACTIVATE',
                'cliente',
                id,
                dadosAntigos.rows[0],
                { ...dadosAntigos.rows[0], ativo: true },
                req.ip
            );
            
            await client.query('COMMIT');
            res.json({ message: 'Cliente reativado com sucesso' });

        } catch (error) {
            await client.query('ROLLBACK');
            res.status(500).json({ error: error.message });
        } finally {
            client.release();
        }
  },
  
    // Buscar histórico de alterações
    getClientHistory: async (req, res) => {
        try {
            const { id } = req.params;
            
            const result = await pool.query(`
                SELECT 
                    al.acao,
                    al.dados_antigos,
                    al.dados_novos,
                    al.ip_address,
                    al.created_at,
                    u.nome as usuario_responsavel
                FROM audit_log al
                LEFT JOIN usuario u ON al.usuario_id = u.usuario_id
                WHERE al.tabela = 'cliente' 
                AND al.registro_id = $1
                ORDER BY al.created_at DESC
            `, [id]);

            res.json(result.rows);

        } catch (error) {
            console.error('Erro ao buscar histórico:', error);
            res.status(500).json({ error: error.message });
        }
    },  
  
   // Atualizar Password
	updatePassword: async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;
        const { nova_senha } = req.body;

        // Validação da nova senha
        if (!nova_senha) {
            throw new Error('Nova senha é obrigatória');
        }

        // Validar se o cliente existe
        const userResult = await client.query(
            'SELECT usuario_id FROM usuario WHERE usuario_id = $1',
            [id]
        );

        if (userResult.rows.length === 0) {
            throw new Error('Cliente não encontrado');
        }

        const hash = await bcrypt.hash(nova_senha, 10);
        
        // Atualizar senha
        await client.query(
            'UPDATE usuario SET senha = $1, updated_at = CURRENT_TIMESTAMP WHERE usuario_id = $2',
            [hash, id]
        );

        // Registrar auditoria (sem incluir senhas no log)
        await registrarAuditoria(
            client,
            req.user?.id,
            'PASSWORD_UPDATE',
            'cliente',
            id,
            { password_changed: true },
            { password_changed: true },
            req.ip
        );

        await client.query('COMMIT');
        res.json({ message: 'Senha atualizada com sucesso' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao atualizar senha:', error);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
  },
  
  // Delete definitivo client
	permanentDelete: async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;

        // Buscar dados para auditoria antes de deletar
        const dadosAntigos = await client.query(`
            SELECT 
                u.nome, u.email,
                ci.telefone, ci.nome_paciente, ci.responsavel
            FROM usuario u
            JOIN cliente_info ci ON u.usuario_id = ci.usuario_id
            WHERE u.usuario_id = $1
        `, [id]);

        if (dadosAntigos.rows.length === 0) {
            throw new Error('Cliente não encontrado');
        }

        // Verificar dependências antes de deletar
        const dependenciasResult = await client.query(`
            SELECT COUNT(*) as count
            FROM agendamento
            WHERE cliente_info_id IN (
                SELECT cliente_info_id 
                FROM cliente_info 
                WHERE usuario_id = $1
            )
        `, [id]);

        if (dependenciasResult.rows[0].count > 0) {
            throw new Error('Não é possível excluir o cliente pois existem agendamentos vinculados');
        }

        // Deletar em ordem (respeitando as foreign keys)
        await client.query('DELETE FROM usuario_perfil WHERE usuario_id = $1', [id]);
        await client.query('DELETE FROM cliente_info WHERE usuario_id = $1', [id]);
        await client.query('DELETE FROM usuario WHERE usuario_id = $1', [id]);

        // Registrar auditoria
        await registrarAuditoria(
            client,
            req.user?.id,
            'PERMANENT_DELETE',
            'cliente',
            id,
            dadosAntigos.rows[0],
            null,
            req.ip
        );

        await client.query('COMMIT');
        res.json({ message: 'Cliente excluído permanentemente' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao excluir cliente:', error);
        res.status(error.message.includes('agendamentos vinculados') ? 400 : 500)
           .json({ error: error.message });
    } finally {
        client.release();
    }
  },
  
	// Busca avançada de clientes
	searchClients: async (req, res) => {
		try {
			const { 
				nome, 
				email, 
				telefone, 
				status, 
				dataInicio, 
				dataFim 
			} = req.query;
	
			let query = `
				SELECT 
					u.usuario_id,
					u.nome,
					u.email,
					u.ativo,
					ci.telefone,
					ci.nome_paciente,
					ci.responsavel,
					u.data_criacao
				FROM usuario u
				JOIN cliente_info ci ON u.usuario_id = ci.usuario_id
				WHERE 1=1
			`;
	
			const params = [];
			let paramCount = 1;
	
			if (nome) {
				query += ` AND u.nome ILIKE $${paramCount}`;
				params.push(`%${nome}%`);
				paramCount++;
			}
	
			if (email) {
				query += ` AND u.email ILIKE $${paramCount}`;
				params.push(`%${email}%`);
				paramCount++;
			}
	
			if (telefone) {
				query += ` AND ci.telefone ILIKE $${paramCount}`;
				params.push(`%${telefone}%`);
				paramCount++;
			}
	
			if (status) {
				query += ` AND u.ativo = $${paramCount}`;
				params.push(status === 'active');
				paramCount++;
			}
	
			if (dataInicio) {
				query += ` AND u.data_criacao >= $${paramCount}`;
				params.push(dataInicio);
				paramCount++;
			}
	
			if (dataFim) {
				query += ` AND u.data_criacao <= $${paramCount}`;
				params.push(dataFim);
				paramCount++;
			}
	
			const result = await pool.query(query, params);
			res.json(result.rows);
	
		} catch (error) {
			console.error('Erro na busca de clientes:', error);
			res.status(500).json({ error: error.message });
		}
	},
	
	// Exportação para CSV
	exportToCSV: async (req, res) => {
		try {
			const result = await pool.query(`
				SELECT 
					u.nome,
					u.email,
					ci.telefone,
					ci.nome_paciente,
					CASE WHEN u.ativo THEN 'Ativo' ELSE 'Inativo' END as status,
					to_char(u.data_criacao, 'DD/MM/YYYY HH24:MI:SS') as data_cadastro
				FROM usuario u
				JOIN cliente_info ci ON u.usuario_id = ci.usuario_id
				JOIN usuario_perfil up ON u.usuario_id = up.usuario_id
				JOIN perfil p ON up.perfil_id = p.perfil_id
				WHERE p.nome = 'Cliente'
				ORDER BY u.nome
			`);
	
        // Criar cabeçalho do CSV
        const header = ['Nome', 'Email', 'Telefone', 'Nome do Paciente', 'Status', 'Data de Cadastro'];
        
        // Converter dados para formato CSV
        const rows = result.rows.map(row => [
            row.nome,
            row.email,
            row.telefone || '',
            row.nome_paciente || '',
            row.status,
            row.data_cadastro
        ].map(field => `"${field}"`).join(','));

        const csvContent = [header.join(','), ...rows].join('\n');
	
        // Configurar headers da resposta
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=clientes.csv');
        
        // Enviar o CSV
        res.send(csvContent);
	
		} catch (error) {
			console.error('Erro na exportação para CSV:', error);
			res.status(500).json({ error: error.message });
		}
	}  
};

module.exports = clientController;