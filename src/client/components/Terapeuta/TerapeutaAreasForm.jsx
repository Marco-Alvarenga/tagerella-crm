// src/client/components/Terapeuta/TerapeutaAreasForm.jsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Autocomplete,
    TextField,
    Chip,
    Paper,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Alert,
    Button
} from '@mui/material';
import { Delete, Add } from '@mui/icons-material';
import { terapeutaService } from '../../services/api';

const TerapeutaAreasForm = ({ terapeuta, onSave, readOnly = false }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [especialidades, setEspecialidades] = useState([]);
    const [areasAtuacao, setAreasAtuacao] = useState([]);
    const [selectedEspecialidades, setSelectedEspecialidades] = useState([]);
    const [selectedAreas, setSelectedAreas] = useState([]);
    const [novaEspecialidade, setNovaEspecialidade] = useState('');
    const [novaArea, setNovaArea] = useState('');

    // Carregar dados
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [espData, areasData] = await Promise.all([
                    terapeutaService.getEspecialidades(),
                    terapeutaService.getAreasAtuacao()
                ]);
                setEspecialidades(espData);
                setAreasAtuacao(areasData);

                // Se tem terapeuta, carregar seleções existentes
                if (terapeuta) {
                    setSelectedEspecialidades(terapeuta.especialidades || []);
                    setSelectedAreas(terapeuta.areas_atuacao || []);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [terapeuta]);

    const handleSubmit = async () => {
        if (selectedEspecialidades.length === 0) {
            setError('Selecione pelo menos uma especialidade');
            return;
        }

        try {
            setLoading(true);
            await onSave({
                especialidades: selectedEspecialidades.map(esp => esp.especialidade_id),
                areas_atuacao: selectedAreas.map(area => area.area_id)
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEspecialidade = () => {
        if (!novaEspecialidade) return;
        
        setSelectedEspecialidades(prev => [...prev, {
            especialidade_id: `temp_${Date.now()}`,
            nome: novaEspecialidade
        }]);
        setNovaEspecialidade('');
    };

    const handleAddArea = () => {
        if (!novaArea) return;
        
        setSelectedAreas(prev => [...prev, {
            area_id: `temp_${Date.now()}`,
            nome: novaArea
        }]);
        setNovaArea('');
    };

    return (
        <Box>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Especialidades
                </Typography>

                {!readOnly && (
                    <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                        <Autocomplete
                            options={especialidades}
                            getOptionLabel={(option) => option.nome}
                            value={null}
                            onChange={(_, newValue) => {
                                if (newValue) {
                                    setSelectedEspecialidades(prev => [...prev, newValue]);
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Selecionar Especialidade"
                                    fullWidth
                                />
                            )}
                            sx={{ flexGrow: 1 }}
                        />

                        <TextField
                            label="Nova Especialidade"
                            value={novaEspecialidade}
                            onChange={(e) => setNovaEspecialidade(e.target.value)}
                            sx={{ flexGrow: 1 }}
                        />

                        <Button
                            variant="contained"
                            onClick={handleAddEspecialidade}
                            startIcon={<Add />}
                        >
                            Adicionar
                        </Button>
                    </Box>
                )}

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedEspecialidades.map((esp) => (
                        <Chip
                            key={esp.especialidade_id}
                            label={esp.nome}
                            onDelete={readOnly ? undefined : () => {
                                setSelectedEspecialidades(prev =>
                                    prev.filter(e => e.especialidade_id !== esp.especialidade_id)
                                );
                            }}
                        />
                    ))}
                </Box>
            </Paper>

            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Áreas de Atuação
                </Typography>

                {!readOnly && (
                    <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                        <Autocomplete
                            options={areasAtuacao}
                            getOptionLabel={(option) => option.nome}
                            value={null}
                            onChange={(_, newValue) => {
                                if (newValue) {
                                    setSelectedAreas(prev => [...prev, newValue]);
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Selecionar Área"
                                    fullWidth
                                />
                            )}
                            sx={{ flexGrow: 1 }}
                        />

                        <TextField
                            label="Nova Área"
                            value={novaArea}
                            onChange={(e) => setNovaArea(e.target.value)}
                            sx={{ flexGrow: 1 }}
                        />

                        <Button
                            variant="contained"
                            onClick={handleAddArea}
                            startIcon={<Add />}
                        >
                            Adicionar
                        </Button>
                    </Box>
                )}

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedAreas.map((area) => (
                        <Chip
                            key={area.area_id}
                            label={area.nome}
                            onDelete={readOnly ? undefined : () => {
                                setSelectedAreas(prev =>
                                    prev.filter(a => a.area_id !== area.area_id)
                                );
                            }}
                        />
                    ))}
                </Box>
            </Paper>

            {!readOnly && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        Salvar Alterações
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default TerapeutaAreasForm;