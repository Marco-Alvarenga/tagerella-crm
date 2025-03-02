// src/client/components/Terapeuta/TerapeutaAgenda.jsx
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Box,
    Tabs,
    Tab,
    Alert,
    Button,
    Paper,
    Chip,
    FormControlLabel,
    Switch,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import { Close, Save, Add, Delete } from '@mui/icons-material';
import { terapeutaService } from '../../services/api';

// Componente TabPanel reutilizado
const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
};

const TerapeutaAgenda = ({ open, onClose, terapeuta }) => {
    // Estados
    const [currentTab, setCurrentTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Estados para disponibilidade
    const [disponibilidade, setDisponibilidade] = useState([]);
    const [editingDay, setEditingDay] = useState(null);
    const [newHorario, setNewHorario] = useState({
        dia_semana: '',
        hora_inicio: '',
        hora_fim: ''
    });

    // Estados para agendamentos
    const [agendamentos, setAgendamentos] = useState([]);
    const [filtroData, setFiltroData] = useState({
        inicio: new Date().toISOString().split('T')[0],
        fim: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]
    });

    // Carregar dados
    useEffect(() => {
        fetchDisponibilidade();
        fetchAgendamentos();
    }, [terapeuta.terapeuta_info_id]);

    // Buscar disponibilidade
    const fetchDisponibilidade = async () => {
        try {
            const data = await terapeutaService.getDisponibilidade(terapeuta.terapeuta_info_id);
            setDisponibilidade(data);
        } catch (err) {
            setError('Erro ao carregar disponibilidade');
        }
    };

    // Buscar agendamentos
    const fetchAgendamentos = async () => {
        try {
            const data = await terapeutaService.getAgendamentos(
                terapeuta.terapeuta_info_id,
                filtroData.inicio,
                filtroData.fim
            );
            setAgendamentos(data);
        } catch (err) {
            setError('Erro ao carregar agendamentos');
        }
    };

    // Handler para adicionar horário
    const handleAddHorario = () => {
        if (!newHorario.dia_semana || !newHorario.hora_inicio || !newHorario.hora_fim) {
            setError('Preencha todos os campos');
            return;
        }

        // Validar horários
        const inicio = new Date(`2000-01-01T${newHorario.hora_inicio}`);
        const fim = new Date(`2000-01-01T${newHorario.hora_fim}`);
        
        if (inicio >= fim) {
            setError('Hora de início deve ser menor que hora de fim');
            return;
        }

        // Verificar sobreposição
        const diaDisponibilidade = disponibilidade.filter(d => 
            d.dia_semana === parseInt(newHorario.dia_semana)
        );

        const temSobreposicao = diaDisponibilidade.some(d => {
            const dInicio = new Date(`2000-01-01T${d.hora_inicio}`);
            const dFim = new Date(`2000-01-01T${d.hora_fim}`);
            return (inicio < dFim && fim > dInicio);
        });

        if (temSobreposicao) {
            setError('Existe sobreposição com outro horário');
            return;
        }

        setDisponibilidade([...disponibilidade, {
            ...newHorario,
            dia_semana: parseInt(newHorario.dia_semana)
        }]);

        setNewHorario({
            dia_semana: '',
            hora_inicio: '',
            hora_fim: ''
        });
    };

    // Handler para remover horário
    const handleRemoveHorario = (index) => {
        const newDisponibilidade = [...disponibilidade];
        newDisponibilidade.splice(index, 1);
        setDisponibilidade(newDisponibilidade);
    };

    // Salvar disponibilidade
    const handleSaveDisponibilidade = async () => {
        try {
            setLoading(true);
            await terapeutaService.setDisponibilidade(terapeuta.terapeuta_info_id, disponibilidade);
            setSuccess('Disponibilidade atualizada com sucesso');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handler para atualizar status do agendamento
    const handleUpdateStatus = async (agendamentoId, novoStatus) => {
        try {
            await terapeutaService.updateAgendamentoStatus(agendamentoId, novoStatus);
            fetchAgendamentos();
            setSuccess('Status atualizado com sucesso');
        } catch (err) {
            setError(err.message);
        }
    };

    // Renderizar nome do dia da semana
    const getDiaSemana = (dia) => {
        const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        return dias[dia];
    };

    // Formatar hora
    const formatarHora = (hora) => {
        return hora.substring(0, 5);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <span>Agenda - {terapeuta.nome}</span>
                    <IconButton onClick={onClose} size="small">
                        <Close />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}
                
                {success && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                        {success}
                    </Alert>
                )}

                <Tabs
                    value={currentTab}
                    onChange={(e, newValue) => setCurrentTab(newValue)}
                    sx={{ mb: 2 }}
                >
                    <Tab label="Disponibilidade" />
                    <Tab label="Agendamentos" />
                </Tabs>

                <TabPanel value={currentTab} index={0}>
                    {/* Formulário para adicionar horário */}
                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                            <TextField
                                select
                                label="Dia da Semana"
                                value={newHorario.dia_semana}
                                onChange={(e) => setNewHorario({
                                    ...newHorario,
                                    dia_semana: e.target.value
                                })}
                                sx={{ width: 200 }}
                            >
                                {[0,1,2,3,4,5,6].map(dia => (
                                    <option key={dia} value={dia}>
                                        {getDiaSemana(dia)}
                                    </option>
                                ))}
                            </TextField>

                            <TextField
                                type="time"
                                label="Hora Início"
                                value={newHorario.hora_inicio}
                                onChange={(e) => setNewHorario({
                                    ...newHorario,
                                    hora_inicio: e.target.value
                                })}
                                InputLabelProps={{ shrink: true }}
                            />

                            <TextField
                                type="time"
                                label="Hora Fim"
                                value={newHorario.hora_fim}
                                onChange={(e) => setNewHorario({
                                    ...newHorario,
                                    hora_fim: e.target.value
                                })}
                                InputLabelProps={{ shrink: true }}
                            />

                            <Button
                                variant="contained"
                                onClick={handleAddHorario}
                                startIcon={<Add />}
                            >
                                Adicionar
                            </Button>
                        </Box>
                    </Paper>

                    {/* Lista de horários */}
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Dia</TableCell>
                                    <TableCell>Horário</TableCell>
                                    <TableCell align="right">Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {[...disponibilidade]
                                    .sort((a, b) => a.dia_semana - b.dia_semana)
                                    .map((horario, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                {getDiaSemana(horario.dia_semana)}
                                            </TableCell>
                                            <TableCell>
                                                {formatarHora(horario.hora_inicio)} - {formatarHora(horario.hora_fim)}
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleRemoveHorario(index)}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            onClick={handleSaveDisponibilidade}
                            startIcon={<Save />}
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : 'Salvar Disponibilidade'}
                        </Button>
                    </Box>
                </TabPanel>

                <TabPanel value={currentTab} index={1}>
                    {/* Filtros de agendamentos */}
                    <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                        <TextField
                            type="date"
                            label="Data Inicial"
                            value={filtroData.inicio}
                            onChange={(e) => setFiltroData({
                                ...filtroData,
                                inicio: e.target.value
                            })}
                            InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                            type="date"
                            label="Data Final"
                            value={filtroData.fim}
                            onChange={(e) => setFiltroData({
                                ...filtroData,
                                fim: e.target.value
                            })}
                            InputLabelProps={{ shrink: true }}
                        />

                        <Button
                            variant="outlined"
                            onClick={fetchAgendamentos}
                        >
                            Filtrar
                        </Button>
                    </Box>

                    {/* Lista de agendamentos */}
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Data/Hora</TableCell>
                                    <TableCell>Cliente</TableCell>
                                    <TableCell>Duração</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {agendamentos.map((agendamento) => (
                                    <TableRow key={agendamento.agendamento_id}>
                                        <TableCell>
                                            {new Date(agendamento.data_hora).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            {agendamento.nome_paciente}
                                            <br />
                                            <small>{agendamento.cliente_email}</small>
                                        </TableCell>
                                        <TableCell>
                                            {agendamento.duracao} minutos
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={agendamento.status}
                                                color={
                                                    agendamento.status === 'confirmado' ? 'success' :
                                                    agendamento.status === 'cancelado' ? 'error' :
                                                    'default'
                                                }
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {agendamento.status === 'agendado' && (
                                                <>
                                                    <Button
                                                        size="small"
                                                        color="success"
                                                        onClick={() => handleUpdateStatus(agendamento.agendamento_id, 'confirmado')}
                                                        sx={{ mr: 1 }}
                                                    >
                                                        Confirmar
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleUpdateStatus(agendamento.agendamento_id, 'cancelado')}
                                                    >
                                                        Cancelar
                                                    </Button>
                                                </>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>
            </DialogContent>
        </Dialog>
    );
};

export default TerapeutaAgenda;