// src/client/components/Terapeuta/TerapeutaList.jsx
import React, { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Button, IconButton, TextField, MenuItem, Box, Pagination, Alert, Snackbar,
    Chip, Tooltip
} from '@mui/material';
import {
    Edit, Delete, Refresh, GetApp, History, Schedule, Description,
    Settings, Share
} from '@mui/icons-material';
import { terapeutaService } from '../../services/api';
import TerapeutaForm from './TerapeutaForm';
import TerapeutaAgenda from './TerapeutaAgenda';
import TerapeutaDocumentos from './TerapeutaDocumentos';
import TerapeutaConfig from './TerapeutaConfig';

const TerapeutaList = () => {
    // Estados principais
    const [terapeutas, setTerapeutas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Estados dos modais
    const [openForm, setOpenForm] = useState(false);
    const [openAgenda, setOpenAgenda] = useState(false);
    const [openDocumentos, setOpenDocumentos] = useState(false);
    const [openConfig, setOpenConfig] = useState(false);
    const [selectedTerapeuta, setSelectedTerapeuta] = useState(null);

    // Estados para paginação e filtros
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        especialidade: 'all',
        sortBy: 'nome',
        order: 'ASC',
        limit: 10
    });

    // Buscar terapeutas
    const fetchTerapeutas = async () => {
		try {
			setLoading(true);
			setError('');
			const response = await terapeutaService.getAllTerapeutas({
				page,
				limit: filters.limit,
				sortBy: filters.sortBy,
				order: filters.order,
				search: filters.search,
				status: filters.status !== 'all' ? filters.status : undefined,
				especialidade: filters.especialidade !== 'all' ? filters.especialidade : undefined
			});
			
			// Log para debug
			console.log('Resposta da API:', response);
			
			// Verifica se a resposta é um array ou está dentro de data
			const terapeutasData = Array.isArray(response) ? response : response.data;
			setTerapeutas(terapeutasData || []);
			
			// Verifica se há informações de paginação
			if (response.pagination) {
				setTotalPages(response.pagination.totalPages);
			}
		} catch (err) {
			console.error('Erro ao buscar terapeutas:', err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
    };

    useEffect(() => {
        fetchTerapeutas();
    }, [page, filters]);

    // Handlers
    const handleEdit = (terapeuta) => {
        setSelectedTerapeuta(terapeuta);
        setOpenForm(true);
    };

    const handleOpenAgenda = (terapeuta) => {
        setSelectedTerapeuta(terapeuta);
        setOpenAgenda(true);
    };

    const handleOpenDocumentos = (terapeuta) => {
        setSelectedTerapeuta(terapeuta);
        setOpenDocumentos(true);
    };

    const handleOpenConfig = (terapeuta) => {
        setSelectedTerapeuta(terapeuta);
        setOpenConfig(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja desativar este terapeuta?')) return;
        
        try {
            await terapeutaService.deleteTerapeuta(id);
            setSuccess('Terapeuta desativado com sucesso');
            fetchTerapeutas();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleReactivate = async (id) => {
        try {
            await terapeutaService.reactivateTerapeuta(id);
            setSuccess('Terapeuta reativado com sucesso');
            fetchTerapeutas();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleExportCSV = async () => {
        try {
            const blob = await terapeutaService.exportToCSV();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'terapeutas.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleFormClose = () => {
        setOpenForm(false);
        setSelectedTerapeuta(null);
    };

    const handleFormSubmit = () => {
        fetchTerapeutas();
        handleFormClose();
    };

    return (
        <div className="p-6">
            {/* Cabeçalho com filtros */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <h1 className="text-2xl font-bold">Terapeutas</h1>
                    <Box>
                        <Button
                            variant="contained"
                            onClick={() => setOpenForm(true)}
                            sx={{ mr: 1 }}
                        >
                            Novo Terapeuta
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
                        label="Especialidade"
                        value={filters.especialidade}
                        onChange={(e) => setFilters({ ...filters, especialidade: e.target.value })}
                        sx={{ width: 200 }}
                    >
                        <MenuItem value="all">Todas</MenuItem>
                        {/* Lista de especialidades será carregada do backend */}
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
                            <TableCell>Especialidades</TableCell>
                            <TableCell>Valor Sessão</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {terapeutas.map((terapeuta) => (
                            <TableRow key={terapeuta.terapeuta_info_id}>
                                <TableCell>{terapeuta.nome}</TableCell>
                                <TableCell>{terapeuta.email}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                        {terapeuta.especialidades?.map((esp, index) => (
                                            <Chip
                                                key={index}
                                                label={esp}
                                                size="small"
                                                variant="outlined"
                                            />
                                        ))}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    {terapeuta.valor_sessao?.toLocaleString('pt-BR', {
                                        style: 'currency',
                                        currency: terapeuta.moeda || 'BRL'
                                    })}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={terapeuta.ativo ? 'Ativo' : 'Inativo'}
                                        color={terapeuta.ativo ? 'success' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Tooltip title="Editar">
                                        <IconButton onClick={() => handleEdit(terapeuta)}>
                                            <Edit />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Agenda">
                                        <IconButton onClick={() => handleOpenAgenda(terapeuta)}>
                                            <Schedule />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Documentos">
                                        <IconButton onClick={() => handleOpenDocumentos(terapeuta)}>
                                            <Description />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Configurações">
                                        <IconButton onClick={() => handleOpenConfig(terapeuta)}>
                                            <Settings />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={terapeuta.ativo ? 'Desativar' : 'Reativar'}>
                                        <IconButton 
                                            onClick={() => terapeuta.ativo ? 
                                                handleDelete(terapeuta.terapeuta_info_id) : 
                                                handleReactivate(terapeuta.terapeuta_info_id)}
                                        >
                                            {terapeuta.ativo ? <Delete /> : <Refresh />}
                                        </IconButton>
                                    </Tooltip>
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

            {/* Modais */}
            {openForm && (
                <TerapeutaForm
                    open={openForm}
                    onClose={handleFormClose}
                    onSubmit={handleFormSubmit}
                    terapeuta={selectedTerapeuta}
                />
            )}

            {openAgenda && (
                <TerapeutaAgenda
                    open={openAgenda}
                    onClose={() => {
                        setOpenAgenda(false);
                        setSelectedTerapeuta(null);
                    }}
                    terapeuta={selectedTerapeuta}
                />
            )}

            {openDocumentos && (
                <TerapeutaDocumentos
                    open={openDocumentos}
                    onClose={() => {
                        setOpenDocumentos(false);
                        setSelectedTerapeuta(null);
                    }}
                    terapeuta={selectedTerapeuta}
                />
            )}

            {openConfig && (
                <TerapeutaConfig
                    open={openConfig}
                    onClose={() => {
                        setOpenConfig(false);
                        setSelectedTerapeuta(null);
                    }}
                    terapeuta={selectedTerapeuta}
                    onSubmit={fetchTerapeutas}
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

export default TerapeutaList;