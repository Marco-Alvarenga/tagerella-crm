// src/client/services/api.js

const API_BASE_URL = '/api';

export const clientService = {
    // Função auxiliar para obter headers com token
    getHeaders: () => {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token não encontrado');
        }
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    },

    // Listar clientes com paginação e filtros
    getAllClients: async (params) => {
        try {
            const queryParams = new URLSearchParams(params).toString();
            const response = await fetch(`${API_BASE_URL}/clients?${queryParams}`, {
                headers: clientService.getHeaders()
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                if (response.status === 403) {
                    // Adicionar mais detalhes ao erro
                    throw new Error(`Acesso não autorizado. ${data.message || ''}`);
                }
                throw new Error(data.message || 'Erro ao buscar clientes');
            }
            
            return data;
        } catch (error) {
            console.error('Erro na requisição:', error);
            throw error;
        }
    },

    // Buscar cliente por ID
    getClientById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
            headers: clientService.getHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Cliente não encontrado');
        }
        
        return response.json();
    },

    // Criar novo cliente
    createClient: async (clientData) => {
        const response = await fetch(`${API_BASE_URL}/clients`, {
            method: 'POST',
            headers: clientService.getHeaders(),
            body: JSON.stringify(clientData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao criar cliente');
        }

        return response.json();
    },

    // Atualizar cliente
    updateClient: async (id, clientData) => {
        const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
            method: 'PUT',
            headers: clientService.getHeaders(),
            body: JSON.stringify(clientData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao atualizar cliente');
        }

        return response.json();
    },

    // Alterar senha
    updatePassword: async (id, passwordData) => {
        const response = await fetch(`${API_BASE_URL}/clients/${id}/password`, {
            method: 'PUT',
            headers: clientService.getHeaders(),
            body: JSON.stringify(passwordData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao atualizar senha');
        }

        return response.json();
    },

    // Desativar cliente
    deleteClient: async (id) => {
        const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
            method: 'DELETE',
            headers: clientService.getHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao desativar cliente');
        }

        return response.json();
    },

    // Reativar cliente
    reactivateClient: async (id) => {
        const response = await fetch(`${API_BASE_URL}/clients/reactivate/${id}`, {
            method: 'PUT',
            headers: clientService.getHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao reativar cliente');
        }

        return response.json();
    },

    // Excluir permanentemente
    permanentDelete: async (id) => {
        const response = await fetch(`${API_BASE_URL}/clients/${id}/permanent`, {
            method: 'DELETE',
            headers: clientService.getHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao excluir cliente');
        }

        return response.json();
    },

    // Buscar histórico
    getClientHistory: async (id) => {
        const response = await fetch(`${API_BASE_URL}/clients/${id}/history`, {
            headers: clientService.getHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao buscar histórico');
        }

        return response.json();
    },

    // Exportar para CSV
    exportToCSV: async () => {
        const response = await fetch(`${API_BASE_URL}/clients/export/csv`, {
            headers: clientService.getHeaders()
        });

        if (!response.ok) {
            throw new Error('Erro ao exportar dados');
        }

        return response.blob();
    },
	
	// Promover cliente para terapeuta
	promoteToTerapeuta: async (usuarioId) => {
		const response = await fetch(`${API_BASE_URL}/clients/${usuarioId}/promote-to-terapeuta`, {
			method: 'POST',
			headers: clientService.getHeaders()
		});
	
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Erro ao promover cliente para terapeuta');
		}
	
		return response.json();
	}
};

// Serviço de Terapeutas
export const terapeutaService = {
    // Função auxiliar para obter headers com token
    getHeaders: (contentType = 'application/json') => {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token não encontrado');
        }
        return {
            'Content-Type': contentType,
            'Authorization': `Bearer ${token}`
        };
    },

    // Listar terapeutas com paginação e filtros
    getAllTerapeutas: async (params) => {
        try {
            const queryParams = new URLSearchParams(params).toString();
            const response = await fetch(`${API_BASE_URL}/terapeutas?${queryParams}`, {
                headers: terapeutaService.getHeaders()
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error(`Acesso não autorizado. ${data.message || ''}`);
                }
                throw new Error(data.message || 'Erro ao buscar terapeutas');
            }
            
            return data;
        } catch (error) {
            console.error('Erro na requisição:', error);
            throw error;
        }
    },

    getTerapeutaById: async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/terapeutas/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao buscar terapeuta');
        }

        const data = await response.json();
        console.log('Dados recebidos do servidor:', data); // Debug
        return data;

    } catch (error) {
        console.error('Erro no getTerapeuta:', error);
        throw error;
    }
    },

    getTerapeuta: async (req, res) => {
    try {
        const response = await fetch(`${API_BASE_URL}/terapeutas/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao buscar terapeuta');
        }

        const data = await response.json();
        console.log('Dados recebidos do servidor:', data); // Debug
        return data;

    } catch (error) {
        console.error('Erro no getTerapeuta:', error);
        throw error;
    }
    },

    createTerapeuta: async (data) => {
        const response = await fetch(`${API_BASE_URL}/terapeutas`, {
            method: 'POST',
            headers: terapeutaService.getHeaders(),
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao criar terapeuta');
        }

        return response.json();
    },

    updateTerapeuta: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/terapeutas/${id}`, {
            method: 'PUT',
            headers: terapeutaService.getHeaders(),
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao atualizar terapeuta');
        }

        return response.json();
    },

    deleteTerapeuta: async (id) => {
        const response = await fetch(`${API_BASE_URL}/terapeutas/${id}`, {
            method: 'DELETE',
            headers: terapeutaService.getHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao desativar terapeuta');
        }

        return response.json();
    },

    // Agenda e disponibilidade
    getDisponibilidade: async (terapeutaId) => {
        const response = await fetch(`${API_BASE_URL}/terapeutas/${terapeutaId}/disponibilidade`, {
            headers: terapeutaService.getHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao buscar disponibilidade');
        }

        return response.json();
    },

    setDisponibilidade: async (terapeutaId, disponibilidade) => {
        const response = await fetch(`${API_BASE_URL}/terapeutas/${terapeutaId}/disponibilidade`, {
            method: 'PUT',
            headers: terapeutaService.getHeaders(),
            body: JSON.stringify({ disponibilidade })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao atualizar disponibilidade');
        }

        return response.json();
    },

    getAgendamentos: async (terapeutaId, inicio, fim) => {
        const params = new URLSearchParams({ inicio, fim }).toString();
        const response = await fetch(`${API_BASE_URL}/terapeutas/${terapeutaId}/agendamentos?${params}`, {
            headers: terapeutaService.getHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao buscar agendamentos');
        }

        return response.json();
    },

    updateAgendamentoStatus: async (agendamentoId, status) => {
        const response = await fetch(`${API_BASE_URL}/terapeutas/agendamentos/${agendamentoId}/status`, {
            method: 'PUT',
            headers: terapeutaService.getHeaders(),
            body: JSON.stringify({ status })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao atualizar status do agendamento');
        }

        return response.json();
    },

    // Documentos
    uploadDocumento: async (terapeutaId, formData) => {
		const token = localStorage.getItem('token');
		if (!token) {
			throw new Error('Token não encontrado');
		}
	
		try {
			const response = await fetch(`${API_BASE_URL}/terapeutas/${terapeutaId}/documentos`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`
					// Importante: NÃO definir Content-Type aqui
				},
				body: formData
			});
	
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Erro ao enviar documento');
			}
	
			return response.json();
		} catch (error) {
			console.error('Erro no upload:', error);
			throw error;
		}
    },

    listarDocumentos: async (terapeutaId) => {
        const response = await fetch(`${API_BASE_URL}/terapeutas/${terapeutaId}/documentos`, {
            headers: terapeutaService.getHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao listar documentos');
        }

        return response.json();
    },

	downloadDocumento: async (documentoId) => {
		try {
			const response = await fetch(`${API_BASE_URL}/terapeutas/documentos/${documentoId}`, {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				}
			});
	
			if (!response.ok) {
				throw new Error('Erro ao baixar documento');
			}
	
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `documento-${documentoId}`; // Nome do arquivo para download
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Erro ao baixar documento:', error);
			throw error;
		}
	},

    deleteDocumento: async (documentoId) => {
		try {
			const response = await fetch(`${API_BASE_URL}/terapeutas/documentos/${documentoId}`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				}
			});
	
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Erro ao excluir documento');
			}
	
			return response.json();
		} catch (error) {
			console.error('Erro ao excluir documento:', error);
			throw error;
		}
    },

    // Configurações
    updateConfig: async (terapeutaId, data) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token não encontrado');
        }

        console.log('Dados sendo enviados:', data); // Debug

        const response = await fetch(`${API_BASE_URL}/terapeutas/${terapeutaId}/profissional`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // Dados profissionais
                profissao_id: data.profissao_id,
                registro_numero: data.numero_conselho,
                registro_sigla: data.registro_sigla,
                registro_validade: data.registro_validade,
                universidade: data.universidade,
                experiencia: data.experiencia,
                descricao: data.descricao,
                modalidade_atendimento: data.modalidade_atendimento,

                // Dados financeiros
                valor_sessao: data.valor_sessao,
                tempo_sessao: data.tempo_sessao,
                pix: data.pix,
                banco: data.banco,
                agencia: data.agencia,
                conta: data.conta,
                moeda: data.moeda
            })
        });

        const responseData = await response.json();
        console.log('Resposta do servidor:', responseData); // Debug

        return responseData;
    } catch (error) {
        console.error('Erro ao atualizar configurações:', error);
        throw error;
    }
    },

    updateFotoPerfil: async (terapeutaId, formData) => {
	   try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token não encontrado');
        }	
		
        const response = await fetch(`${API_BASE_URL}/terapeutas/${terapeutaId}/foto`, {
            method: 'POST',
            headers:{
                'Authorization': `Bearer ${token}`
                // Não incluir Content-Type aqui para multipart/form-data
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao atualizar foto');
        }

        return response.json();
    } catch (error) {
        console.error('Erro ao atualizar assinatura:', error);
        throw error;
    }
    },

    updateAssinatura: async (terapeutaId, formData) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token não encontrado');
        }

        const response = await fetch(`${API_BASE_URL}/terapeutas/${terapeutaId}/assinatura`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // Não incluir Content-Type aqui para multipart/form-data
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao atualizar assinatura');
        }

        return response.json();
    } catch (error) {
        console.error('Erro ao atualizar assinatura:', error);
        throw error;
    }
    },

    // Dados auxiliares
    getProfissoes: async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token não encontrado');
        }
		
        const response = await fetch(`${API_BASE_URL}/profissoes`, {
			method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
                // Não incluir Content-Type aqui para multipart/form-data
            },
        });

       if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao atualizar assinatura');
        }

        return response.json();
    } catch (error) {
        console.error('Erro ao atualizar assinatura:', error);
        throw error;
    }
    },

    getEspecialidades: async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token não encontrado');
        }
		
        const response = await fetch(`${API_BASE_URL}/especialidades`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
                // Não incluir Content-Type aqui para multipart/form-data
            },
        });

       if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao atualizar assinatura');
        }

        return response.json();
    } catch (error) {
        console.error('Erro ao atualizar assinatura:', error);
        throw error;
    }
    },

    getAreasAtuacao: async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token não encontrado');
        }
				
        const response = await fetch(`${API_BASE_URL}/areas-atuacao`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
                // Não incluir Content-Type aqui para multipart/form-data
            },
        });

       if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao atualizar assinatura');
        }

        return response.json();
    } catch (error) {
        console.error('Erro ao atualizar assinatura:', error);
        throw error;
    }
    }
};