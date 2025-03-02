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
		observacoes: '',
		timezone: Intl.DateTimeFormat().resolvedOptions().timeZone // Timezone local
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
	
	const handleCloseDialog = () => {
		setOpenAgendamentoDialog(false);
		setAgendamentoForm({
			cliente_id: '',
			data: '',
			hora: '',
			duracao: 50,
			observacoes: '',
			timezone: Intl.DateTimeFormat().resolvedOptions().timeZone // Adicionar timezone
		});
		setError('');
	};	

	const handleSaveAgendamento = async () => {
		if (!agendamentoForm.cliente_id || !agendamentoForm.data || !agendamentoForm.hora) {
			setError('Preencha todos os campos obrigatórios');
			return;
		}
	
		// Verificar sobreposição
		const horarioAgendamento = new Date(`${agendamentoForm.data}T${agendamentoForm.hora}`);
		const fimAgendamento = new Date(horarioAgendamento.getTime() + agendamentoForm.duracao * 60000);
	
		const temSobreposicao = agendamentos.some(agend => {
			const horarioExistente = new Date(agend.data_hora);
			const fimExistente = new Date(horarioExistente.getTime() + agend.duracao * 60000);
	
			return (
				(horarioAgendamento >= horarioExistente && horarioAgendamento < fimExistente) ||
				(fimAgendamento > horarioExistente && fimAgendamento <= fimExistente)
			);
		});
	
		if (temSobreposicao) {
			setError('Já existe um agendamento neste horário');
			return;
		}
	
		try {
			setLoading(true);
			await terapeutaService.createAgendamento({
				...agendamentoForm,
				terapeuta_info_id: terapeuta.terapeuta_info_id,
				timezone: agendamentoForm.timezone
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
		
		// Formatar a hora considerando o timezone
		const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
			hour: '2-digit',
			minute: '2-digit',
			timeZoneName: 'short'
		});		
		
		// Não permite agendamentos em datas passadas
		const now = new Date();
		const slotDate = new Date(date);
		slotDate.setHours(parseInt(hora.split(':')[0]), parseInt(hora.split(':')[1]));
		
		if (slotDate < now) {
			return null;
		}
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
                    label={`${agendamento.cliente_nome} - ${timeFormatter.format(new Date(agendamento.data_hora))} - ${agendamento.status}`}
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
                                    <Box sx={{ border: '1px solid grey', height: 60, p: 0.5 }}>
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
                onClose={() => handleCloseDialog()}
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
							})}
								fullWidth
								required
                        >
                            {clientes.map(cliente => (
                                <MenuItem key={cliente.cliente_info_id} value={cliente.cliente_info_id}>
                                    {cliente.nome_paciente || cliente.nome}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <TextField
                                type="date"
                                label="Data"
                                value={agendamentoForm.data}
                                onChange={(e) => setAgendamentoForm({
                                    ...agendamentoForm,
                                    data: e.target.value
                                })}
                                fullWidth
                                required
                                InputLabelProps={{ shrink: true }}
                            />

                            <TextField
                                type="time"
                                label="Horário"
                                value={agendamentoForm.hora}
                                onChange={(e) => setAgendamentoForm({
                                    ...agendamentoForm,
                                    hora: e.target.value
                                })}
                                fullWidth
                                required
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>

                        <TextField
                            type="number"
                            label="Duração (minutos)"
                            value={agendamentoForm.duracao}
                            onChange={(e) => setAgendamentoForm({
                                ...agendamentoForm,
                                duracao: e.target.value
                            })}
                            fullWidth
                            margin="normal"
                            InputProps={{
                                startAdornment: <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                        />

                        <TextField
                            label="Observações"
                            value={agendamentoForm.observacoes}
                            onChange={(e) => setAgendamentoForm({
                                ...agendamentoForm,
                                observacoes: e.target.value
                            })}
                            fullWidth
                            margin="normal"
                            multiline
                            rows={3}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleCloseDialog()}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveAgendamento}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <Today />}
                    >
                        {loading ? 'Salvando...' : 'Agendar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Legenda */}
            <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Chip label="Disponível" variant="outlined" />
                <Chip label="Agendado" color="default" />
                <Chip label="Confirmado" color="success" />
                <Chip label="Cancelado" color="error" />
            </Box>
        </Box>
    );
};

export default TerapeutaCalendario;