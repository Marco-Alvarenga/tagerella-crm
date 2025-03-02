// src/client/components/Clients/ClientList.jsx
import React, { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Button, IconButton, TextField, MenuItem, Box, Pagination, Alert, Snackbar,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Edit, Delete, Refresh, GetApp, History, Psychology } from '@mui/icons-material';
import { clientService } from '../../services/api';
import ClientForm from './ClientForm';
import ClientHistory from './ClientHistory';

const ClientList = () => {
    // Estados
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [openForm, setOpenForm] = useState(false);
    const [openHistory, setOpenHistory] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    // Estados para paginação e filtros
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        sortBy: 'nome',
        order: 'ASC',
        limit: 10
    });

    // Buscar clientes
    const fetchClients = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await clientService.getAllClients({
                page,
                limit: filters.limit,
                sortBy: filters.sortBy,
                order: filters.order,
                search: filters.search,
                status: filters.status
            });
            
            setClients(response.data || []);
            setTotalPages(response.pagination?.totalPages || 1);
        } catch (err) {
            console.error('Erro ao buscar clientes:', err);
            setError(err.message);
            
            // Se for erro de autorização, mostrar mensagem por alguns segundos antes de redirecionar
            if (err.message.includes('Acesso não autorizado')) {
                setTimeout(() => {
                    localStorage.clear(); // Limpar dados do localStorage
                    window.location.href = '/login';
                }, 3000);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, [page, filters]);

    // Handlers
    const handleEdit = (client) => {
        setSelectedClient(client);
        setOpenForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja desativar este cliente?')) return;
        
        try {
            await clientService.deleteClient(id);
            setSuccess('Cliente desativado com sucesso');
            fetchClients();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleReactivate = async (id) => {
        try {
            await clientService.reactivateClient(id);
            setSuccess('Cliente reativado com sucesso');
            fetchClients();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleExportCSV = async () => {
        try {
            const blob = await clientService.exportToCSV();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'clientes.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (err) {
            setError(err.message);
        }
    };
	
	const handlePromoteToTerapeuta = async (client) => {
		if (!window.confirm(`Deseja promover ${client.nome} para terapeuta?`)) {
			return;
		}
	
		try {
			const response = await clientService.promoteToTerapeuta(client.usuario_id);
			setSuccess(`${client.nome} promovido para terapeuta com sucesso!`);
			fetchClients(); // Atualiza a lista
		} catch (err) {
			setError(err.message);
		}
	};	

    const handleViewHistory = (client) => {
        setSelectedClient(client);
        setOpenHistory(true);
    };

    const handleFormClose = () => {
        setOpenForm(false);
        setSelectedClient(null);
    };

    const handleFormSubmit = () => {
        fetchClients();
        handleFormClose();
    };

    return (
        <div className="p-6">
            {/* Cabeçalho com filtros */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <h1 className="text-2xl font-bold">Clientes</h1>
                    <Box>
                        <Button
                            variant="contained"
                            onClick={() => setOpenForm(true)}
                            sx={{ mr: 1 }}
                        >
                            Novo Cliente
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleExportCSV}
                            startIcon={<GetApp />}
                        >
                            Exportar CSV
                        </Button>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        size="small"
                        label="Buscar"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                    <TextField
                        select
                        size="small"
                        label="Status"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        sx={{ width: 150 }}
                    >
                        <MenuItem value="all">Todos</MenuItem>
                        <MenuItem value="active">Ativos</MenuItem>
                        <MenuItem value="inactive">Inativos</MenuItem>
                    </TextField>
                    <TextField
                        select
                        size="small"
                        label="Ordenar por"
                        value={filters.sortBy}
                        onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                        sx={{ width: 150 }}
                    >
                        <MenuItem value="nome">Nome</MenuItem>
                        <MenuItem value="email">Email</MenuItem>
                        <MenuItem value="data_criacao">Data de Cadastro</MenuItem>
                    </TextField>
                </Box>
            </Box>

            {/* Tabela */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nome</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Telefone</TableCell>
                            <TableCell>Nome do Paciente</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {clients.map((client) => (
                            <TableRow key={client.usuario_id}>
                                <TableCell>{client.nome}</TableCell>
                                <TableCell>{client.email}</TableCell>
                                <TableCell>{client.telefone}</TableCell>
                                <TableCell>{client.nome_paciente}</TableCell>
                                <TableCell>
                                    {client.ativo ? 'Ativo' : 'Inativo'}
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleEdit(client)}>
                                        <Edit />
                                    </IconButton>
                                    <IconButton 
                                        onClick={() => client.ativo ? 
                                            handleDelete(client.usuario_id) : 
                                            handleReactivate(client.usuario_id)}
                                    >
                                        {client.ativo ? <Delete /> : <Refresh />}
                                    </IconButton>
									{client.ativo && (
										<IconButton 
											onClick={() => handlePromoteToTerapeuta(client)}
											color="primary"
										>
											<Psychology />
										</IconButton>
									)}									
                                    <IconButton onClick={() => handleViewHistory(client)}>
                                        <History />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Paginação */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Pagination 
                    count={totalPages} 
                    page={page} 
                    onChange={(e, v) => setPage(v)}
                />
            </Box>

            {/* Formulário Modal */}
            {openForm && (
                <ClientForm
                    open={openForm}
                    onClose={handleFormClose}
                    onSubmit={handleFormSubmit}
                    client={selectedClient}
                />
            )}

            {/* Modal de Histórico */}
            {openHistory && (
                <ClientHistory
                    open={openHistory}
                    onClose={() => setOpenHistory(false)}
                    clientId={selectedClient?.usuario_id}
                />
            )}

            {/* Notificações */}
            <Snackbar 
                open={!!error} 
                autoHideDuration={6000} 
                onClose={() => setError('')}
            >
                <Alert severity="error">{error}</Alert>
            </Snackbar>

            <Snackbar 
                open={!!success} 
                autoHideDuration={6000} 
                onClose={() => setSuccess('')}
            >
                <Alert severity="success">{success}</Alert>
            </Snackbar>
        </div>
    );
};

export default ClientList;