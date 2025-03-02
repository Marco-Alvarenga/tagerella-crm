// src/server/controllers/terapeuta-agenda.controller.js
const pool = require('../config/database');

const terapeutaAgendaController = {
    // Gerenciar disponibilidade
    setDisponibilidade: async (req, res) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const { terapeuta_info_id } = req.params;
            const { disponibilidade } = req.body;

            // Remove disponibilidade atual
            await client.query(
                'DELETE FROM terapeuta_disponibilidade WHERE terapeuta_info_id = $1',
                [terapeuta_info_id]
            );

            // Insere nova disponibilidade
            if (disponibilidade && disponibilidade.length > 0) {
                const values = disponibilidade.map(d => 
                    `(${terapeuta_info_id}, ${d.dia_semana}, '${d.hora_inicio}', '${d.hora_fim}', true)`
                ).join(',');

                await client.query(`
                    INSERT INTO terapeuta_disponibilidade 
                    (terapeuta_info_id, dia_semana, hora_inicio, hora_fim, ativo)
                    VALUES ${values}
                `);
            }

            await client.query('COMMIT');
            res.json({ message: 'Disponibilidade atualizada com sucesso' });

        } catch (error) {
            await client.query('ROLLBACK');
            res.status(500).json({ error: error.message });
        } finally {
            client.release();
        }
    },

    // Buscar disponibilidade
    getDisponibilidade: async (req, res) => {
        try {
            const { terapeuta_info_id } = req.params;

            const result = await pool.query(
                `SELECT * FROM terapeuta_disponibilidade 
                 WHERE terapeuta_info_id = $1 AND ativo = true
                 ORDER BY dia_semana, hora_inicio`,
                [terapeuta_info_id]
            );

            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Criar agendamento
    createAgendamento: async (req, res) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const {
                terapeuta_info_id,
                cliente_info_id,
                data_hora,
                duracao,
                observacoes
            } = req.body;

            // Verifica se horário está disponível
            const disponibilidadeResult = await client.query(`
                SELECT 1 FROM terapeuta_disponibilidade td
                WHERE td.terapeuta_info_id = $1
                AND td.dia_semana = EXTRACT(DOW FROM $2::timestamp)
                AND td.hora_inicio <= $2::time
                AND td.hora_fim >= ($2::time + ($3 || ' minutes')::interval)
                AND td.ativo = true
            `, [terapeuta_info_id, data_hora, duracao]);

            if (disponibilidadeResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: 'Horário indisponível' });
            }

            // Verifica se não há conflito com outros agendamentos
            const conflictResult = await client.query(`
                SELECT 1 FROM agendamento
                WHERE terapeuta_info_id = $1
                AND data_hora < ($2::timestamp + ($3 || ' minutes')::interval)
                AND (data_hora + (duracao || ' minutes')::interval) > $2::timestamp
                AND status NOT IN ('cancelado', 'realizado')
            `, [terapeuta_info_id, data_hora, duracao]);

            if (conflictResult.rows.length > 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: 'Conflito de horário' });
            }

            // Cria agendamento
            const result = await client.query(`
                INSERT INTO agendamento (
                    terapeuta_info_id,
                    cliente_info_id,
                    data_hora,
                    duracao,
                    status,
                    observacoes
                ) VALUES ($1, $2, $3, $4, 'agendado', $5)
                RETURNING agendamento_id
            `, [terapeuta_info_id, cliente_info_id, data_hora, duracao, observacoes]);

            await client.query('COMMIT');
            res.status(201).json({
                message: 'Agendamento criado com sucesso',
                agendamento_id: result.rows[0].agendamento_id
            });

        } catch (error) {
            await client.query('ROLLBACK');
            res.status(500).json({ error: error.message });
        } finally {
            client.release();
        }
    },

    // Listar agendamentos do terapeuta
    getAgendamentos: async (req, res) => {
        try {
            const { terapeuta_info_id } = req.params;
            const { inicio, fim, status } = req.query;

            let query = `
                SELECT 
                    a.*,
                    c.nome_paciente,
                    u.nome as cliente_nome,
                    u.email as cliente_email
                FROM agendamento a
                JOIN cliente_info c ON a.cliente_info_id = c.cliente_info_id
                JOIN usuario u ON c.usuario_id = u.usuario_id
                WHERE a.terapeuta_info_id = $1
            `;

            const params = [terapeuta_info_id];
            let paramCount = 2;

            if (inicio) {
                query += ` AND a.data_hora >= $${paramCount}`;
                params.push(inicio);
                paramCount++;
            }

            if (fim) {
                query += ` AND a.data_hora <= $${paramCount}`;
                params.push(fim);
                paramCount++;
            }

            if (status) {
                query += ` AND a.status = $${paramCount}`;
                params.push(status);
            }

            query += ' ORDER BY a.data_hora DESC';

            const result = await pool.query(query, params);
            res.json(result.rows);

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Atualizar status do agendamento
    updateAgendamentoStatus: async (req, res) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const { agendamento_id } = req.params;
            const { status, observacoes } = req.body;

            const result = await client.query(`
                UPDATE agendamento 
                SET status = $1, observacoes = COALESCE($2, observacoes)
                WHERE agendamento_id = $3
                RETURNING *
            `, [status, observacoes, agendamento_id]);

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ message: 'Agendamento não encontrado' });
            }

            // Se cancelado, registra na auditoria
            if (status === 'cancelado') {
                await client.query(`
                    INSERT INTO audit_log (
                        usuario_id,
                        acao,
                        tabela,
                        registro_id,
                        dados_antigos,
                        dados_novos
                    ) VALUES ($1, 'cancelamento', 'agendamento', $2, $3, $4)
                `, [
                    req.user.usuario_id,
                    agendamento_id,
                    JSON.stringify({ status: result.rows[0].status }),
                    JSON.stringify({ status: 'cancelado', observacoes })
                ]);
            }

            await client.query('COMMIT');
            res.json({
                message: 'Status do agendamento atualizado com sucesso',
                agendamento: result.rows[0]
            });

        } catch (error) {
            await client.query('ROLLBACK');
            res.status(500).json({ error: error.message });
        } finally {
            client.release();
        }
    },

    // Buscar horários disponíveis
    getHorariosDisponiveis: async (req, res) => {
        try {
            const { terapeuta_info_id, data } = req.params;

            // Busca disponibilidade para o dia da semana
            const disponibilidadeResult = await pool.query(`
                SELECT hora_inicio, hora_fim
                FROM terapeuta_disponibilidade
                WHERE terapeuta_info_id = $1
                AND dia_semana = EXTRACT(DOW FROM $2::date)
                AND ativo = true
            `, [terapeuta_info_id, data]);

            if (disponibilidadeResult.rows.length === 0) {
                return res.json([]);
            }

            // Busca agendamentos existentes para o dia
            const agendamentosResult = await pool.query(`
                SELECT data_hora, duracao
                FROM agendamento
                WHERE terapeuta_info_id = $1
                AND date_trunc('day', data_hora) = $2::date
                AND status NOT IN ('cancelado', 'realizado')
            `, [terapeuta_info_id, data]);

            // Processa horários disponíveis
            const horariosDisponiveis = [];
            const intervalo = 30; // minutos

            for (const disp of disponibilidadeResult.rows) {
                let horario = new Date(`${data}T${disp.hora_inicio}`);
                const fim = new Date(`${data}T${disp.hora_fim}`);

                while (horario < fim) {
                    const horarioOcupado = agendamentosResult.rows.some(agend => {
                        const inicio = new Date(agend.data_hora);
                        const termino = new Date(inicio.getTime() + agend.duracao * 60000);
                        return horario >= inicio && horario < termino;
                    });

                    if (!horarioOcupado) {
                        horariosDisponiveis.push(horario.toISOString());
                    }

                    horario = new Date(horario.getTime() + intervalo * 60000);
                }
            }

            res.json(horariosDisponiveis);

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = terapeutaAgendaController;