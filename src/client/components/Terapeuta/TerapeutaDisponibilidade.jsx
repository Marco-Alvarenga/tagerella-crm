// src/client/components/Terapeuta/TerapeutaDisponibilidade.jsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Switch,
    FormControlLabel
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { terapeutaService } from '../../services/api';

const diasSemana = [
    { id: 0, nome: 'Domingo' },
    { id: 1, nome: 'Segunda-feira' },
    { id: 2, nome: 'Terça-feira' },
    { id: 3, nome: 'Quarta-feira' },
    { id: 4, nome: 'Quinta-feira' },
    { id: 5, nome: 'Sexta-feira' },
    { id: 6, nome: 'Sábado' }
];

const TerapeutaDisponibilidade = ({ terapeuta, onSave }) => {
    const [disponibilidade, setDisponibilidade] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editingHorario, setEditingHorario] = useState(null);
    const [formData, setFormData] = useState({
        dia_semana: '',
        hora_inicio: '',
        hora_fim: '',
        ativo: true
    });

    // Carregar disponibilidade
    useEffect(() => {
        const fetchDisponibilidade = async () => {
            try {
                setLoading(true);
                const data = await terapeutaService.getDisponibilidade(terapeuta.terapeuta_info_id);
                setDisponibilidade(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (terapeuta?.terapeuta_info_id) {
            fetchDisponibilidade();
        }
    }, [terapeuta]);

    const handleAddHorario = () => {
        setEditingHorario(null);
        setFormData({
            dia_semana: '',
            hora_inicio: '',
            hora_fim: '',
            ativo: true
        });
        setOpenDialog(true);
    };

    const handleEditHorario = (horario) => {
        setEditingHorario(horario);
        setFormData({
            dia_semana: horario.dia_semana,
            hora_inicio: horario.hora_inicio,
            hora_fim: horario.hora_fim,
            ativo: horario.ativo
        });
        setOpenDialog(true);
    };

    const handleDeleteHorario = (index) => {
        setDisponibilidade(prev => prev.filter((_, i) => i !== index));
    };

    const handleSaveHorario = () => {
        // Validar sobreposição
        const inicio = new Date(`2000-01-01T${formData.hora_inicio}`);
        const fim = new Date(`2000-01-01T${formData.hora_fim}`);
        
        if (inicio >= fim) {
            setError('Hora de início deve ser menor que hora de fim');
            return;
        }

        const diaDisponibilidade = disponibilidade.filter(d => 
            d.dia_semana === parseInt(formData.dia_semana)
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

        if (editingHorario) {
            setDisponibilidade(prev => prev.map(h => 
                h === editingHorario ? { ...formData, dia_semana: parseInt(formData.dia_semana) } : h
            ));
        } else {
            setDisponibilidade(prev => [...prev, { 
                ...formData, 
                dia_semana: parseInt(formData.dia_semana)
            }]);
        }

        setOpenDialog(false);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            await terapeutaService.setDisponibilidade(
                terapeuta.terapeuta_info_id,
                disponibilidade
            );
            onSave();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">
                        Horários de Atendimento
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleAddHorario}
                    >
                        Adicionar Horário
                    </Button>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Dia</TableCell>
                                <TableCell>Início</TableCell>
                                <TableCell>Fim</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {disponibilidade
                                .sort((a, b) => a.dia_semana - b.dia_semana)
                                .map((horario, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            {diasSemana.find(d => d.id === horario.dia_semana)?.nome}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(`2000-01-01T${horario.hora_inicio}`)
                                                .toLocaleTimeString('pt-BR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {new Date(`2000-01-01T${horario.hora_fim}`)
                                                .toLocaleTimeString('pt-BR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={horario.ativo}
                                                        onChange={() => {
                                                            setDisponibilidade(prev =>
                                                                prev.map((h, i) =>
                                                                    i === index ? { ...h, ativo: !h.ativo } : h
                                                                )
                                                            );
                                                        }}
                                                    />
                                                }
                                                label={horario.ativo ? "Ativo" : "Inativo"}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton onClick={() => handleEditHorario(horario)}>
                                                <Edit />
                                            </IconButton>
                                            <IconButton onClick={() => handleDeleteHorario(index)} color="error">
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            {disponibilidade.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        Nenhum horário cadastrado
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        Salvar Alterações
                    </Button>
                </Box>
            </Paper>

            {/* Modal de Adicionar/Editar Horário */}
            <Dialog 
                open={openDialog} 
                onClose={() => setOpenDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {editingHorario ? 'Editar Horário' : 'Novo Horário'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            select
                            label="Dia da Semana"
                            value={formData.dia_semana}
                            onChange={(e) => setFormData({
                                ...formData,
                                dia_semana: e.target.value
                            })}
                            fullWidth
                            margin="normal"
                            SelectProps={{
                                native: true
                            }}
                        >
                            <option value="">Selecione...</option>
                            {diasSemana.map(dia => (
                                <option key={dia.id} value={dia.id}>
                                    {dia.nome}
                                </option>
                            ))}
                        </TextField>

                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <TextField
                                type="time"
                                label="Hora Início"
                                value={formData.hora_inicio}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    hora_inicio: e.target.value
                                })}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />

                            <TextField
                                type="time"
                                label="Hora Fim"
                                value={formData.hora_fim}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    hora_fim: e.target.value
                                })}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.ativo}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        ativo: e.target.checked
                                    })}
                                />
                            }
                            label="Ativo"
                            sx={{ mt: 2 }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>
                        Cancelar
                    </Button>
                    <Button variant="contained" onClick={handleSaveHorario}>
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TerapeutaDisponibilidade;