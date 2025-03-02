//src/client/components/Terapeuta/TerapeutaCalendario.jsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    MenuItem,
    Chip,
    Grid,
    CircularProgress
} from '@mui/material';
import {
    ChevronLeft,
    ChevronRight,
    Today,
    AccessTime,
    Person
} from '@mui/icons-material';
import { terapeutaService } from '../../services/api';

// Helpers
const getWeekDays = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(start);
        day.setDate(start.getDate() + i);
        days.push(day);
    }
    return days;
};

const TerapeutaCalendario = ({ terapeuta }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [agendamentos, setAgendamentos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [openAgendamentoDialog, setOpenAgendamentoDialog] = useState(false);
    const [agendamentoForm, setAgendamentoForm] = useState({
        cliente_id: '',
        data: '',
        hora: '',
        duracao: 50,
        observacoes: ''
    });

    // Estados auxiliares
    const [clientes, setClientes] = useState([]);
    const [disponibilidade, setDisponibilidade] = useState([]);
    const weekDays = getWeekDays(currentDate);

    // Carregar dados
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const inicio = weekDays[0].toISOString();
                const fim = weekDays[6].toISOString();

                const [agendsData, dispData] = await Promise.all([
                    terapeutaService.getAgendamentos(terapeuta.terapeuta_info_id, inicio, fim),
                    terapeutaService.getDisponibilidade(terapeuta.terapeuta_info_id)
                ]);

                setAgendamentos(agendsData);
                setDisponibilidade(dispData);

                // Carregar clientes também
                const clientesData = await terapeutaService.getClientes();
                setClientes(clientesData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [terapeuta.terapeuta_info_id, currentDate]);

    const handlePreviousWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const handleNextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    const handleSlotClick = (date, hora) => {
        setSelectedSlot({ date, hora });
        setAgendamentoForm({
            ...agendamentoForm,
            data: date.toISOString().split('T')[0],
            hora
        });
        setOpenAgendamentoDialog(true);
    };

    const handleSaveAgendamento = async () => {
        if (!agendamentoForm.cliente_id || !agendamentoForm.data || !agendamentoForm.hora) {
            setError('Preencha todos os campos obrigatórios');
            return;
        }

        try {
            setLoading(true);
            await terapeutaService.createAgendamento({
                ...agendamentoForm,
                terapeuta_info_id: terapeuta.terapeuta_info_id
            });

            setOpenAgendamentoDialog(false);
            // Recarregar agendamentos
            const inicio = weekDays[0].toISOString();
            const fim = weekDays[6].toISOString();
            const agendsData = await terapeutaService.getAgendamentos(
                terapeuta.terapeuta_info_id,
                inicio,
                fim
            );
            setAgendamentos(agendsData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const renderTimeSlot = (date, hora) => {
        const agendamento = agendamentos.find(a => {
            const aDate = new Date(a.data_hora);
            return (
                aDate.getDate() === date.getDate() &&
                aDate.getHours() === parseInt(hora.split(':')[0]) &&
                aDate.getMinutes() === parseInt(hora.split(':')[1])
            );
        });

        if (agendamento) {
            return (
                <Chip
                    label={`${agendamento.cliente_nome} - ${agendamento.status}`}
                    color={
                        agendamento.status === 'confirmado' ? 'success' :
                        agendamento.status === 'cancelado' ? 'error' :
                        'default'
                    }
                    onClick={() => {
                        // Aqui poderia abrir um modal com detalhes do agendamento
                    }}
                    sx={{ width: '100%' }}
                />
            );
        }

        const diaSemana = date.getDay();
        const horarioDisponivel = disponibilidade.find(d =>
            d.dia_semana === diaSemana &&
            d.hora_inicio <= hora &&
            d.hora_fim > hora
        );

        if (horarioDisponivel) {
            return (
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleSlotClick(date, hora)}
                    sx={{ width: '100%' }}
                >
                    Disponível
                </Button>
            );
        }

        return null;
    };

    return (
        <Box>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 2 }}>
                {/* Header do Calendário */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton onClick={handlePreviousWeek}>
                        <ChevronLeft />
                    </IconButton>

                    <Typography variant="h6" sx={{ flex: 1, textAlign: 'center' }}>
                        {weekDays[0].toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </Typography>

                    <IconButton onClick={handleNextWeek}>
                        <ChevronRight />
                    </IconButton>
                </Box>

                {/* Grid do Calendário */}
                <Grid container spacing={1}>
                    {/* Cabeçalho dos dias */}
                    {weekDays.map(date => (
                        <Grid item xs key={date.toISOString()}>
                            <Paper
                                sx={{
                                    p: 1,
                                    textAlign: 'center',
                                    bgcolor: 'primary.light',
                                    color: 'primary.contrastText'
                                }}
                            >
                                <Typography variant="subtitle2">
                                    {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                                </Typography>
                                <Typography variant="h6">
                                    {date.getDate()}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}

                    {/* Slots de horário */}
                    {Array.from({ length: 24 }).map((_, hour) => (
                        <Grid container item spacing={1} key={hour}>
                            {weekDays.map(date => (
                                <Grid item xs key={`${date.toISOString()}-${hour}`}>
                                    <Box sx={{ height: 60, p: 0.5 }}>
                                        {renderTimeSlot(date, `${hour.toString().padStart(2, '0')}:00`)}
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    ))}
                </Grid>
            </Paper>

            {/* Modal de Novo Agendamento */}
            <Dialog
                open={openAgendamentoDialog}
                onClose={() => setOpenAgendamentoDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Novo Agendamento</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            select
                            label="Cliente"
                            value={agendamentoForm.cliente_id}
                            onChange={(e) => setAgendamentoForm({
                                ...agendamentoForm,
                                cliente_id: e.target.value