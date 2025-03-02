//src/client/components/Terapeuta/TerapeutaDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Paper,
    Tabs,
    Tab,
    Typography,
    Alert,
	CircularProgress,
    IconButton
} from '@mui/material';
import {
    CalendarMonth,
    Psychology,
    AccessTime,
    Description,
    Close
} from '@mui/icons-material';
import TerapeutaCalendario from './TerapeutaCalendario';
import TerapeutaAreasForm from './TerapeutaAreasForm';
import TerapeutaDisponibilidade from './TerapeutaDisponibilidade';
import TerapeutaDocumentos from './TerapeutaDocumentos';

// Componente TabPanel
const TabPanel = ({ children, value, index, ...other }) => (
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

const TerapeutaDashboard = ({ terapeutas }) => {
    const [currentTab, setCurrentTab] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
	const [terapeuta, setTerapeuta] = useState(null);
    const [loading, setLoading] = useState(true);
	const { id } = useParams();
	
	useEffect(() => {
		const fetchTerapeuta = async () => {
			try {
				const response = await fetch(`/api/terapeutas/${id}`, {
					headers: {
						'Authorization': `Bearer ${localStorage.getItem('token')}`
					}
				});
	
				if (!response.ok) {
					throw new Error('Erro ao carregar dados do terapeuta');
				}
	
				const data = await response.json();
				setTerapeuta(data);
				setError('');
			} catch (err) {
				console.error('Erro ao carregar terapeuta:', err);
				setError(err.message || 'Erro ao conectar com o servidor');
			} finally {
				setLoading(false);
			}
		};
	
		if (id) {
			fetchTerapeuta();
		}
	}, [id]);	

    // Handler de alteração de tab
    const handleChangeTab = (event, newValue) => {
        setCurrentTab(newValue);
        setError('');
        setSuccess('');
    };

    // Handler genérico para sucesso em operações
    const handleSuccess = (message) => {
        setSuccess(message);
        setTimeout(() => setSuccess(''), 5000);
    };

    // Handler genérico para erros
    const handleError = (message) => {
        setError(message);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!terapeuta) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="error">
                    {error || 'Não foi possível carregar os dados do terapeuta'}
                </Alert>
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Psychology sx={{ fontSize: 40, color: 'primary.main' }} />
                    <Box>
                        <Typography variant="h5">
                            {terapeuta.nome}
                        </Typography>
                        <Typography variant="subtitle1" color="textSecondary">
                            {terapeuta.especialidade}
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            {/* Alertas */}
            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    action={
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={() => setError('')}
                        >
                            <Close fontSize="inherit" />
                        </IconButton>
                    }
                >
                    {error}
                </Alert>
            )}

            {success && (
                <Alert
                    severity="success"
                    sx={{ mb: 2 }}
                    action={
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={() => setSuccess('')}
                        >
                            <Close fontSize="inherit" />
                        </IconButton>
                    }
                >
                    {success}
                </Alert>
            )}

            {/* Tabs */}
            <Paper sx={{ mb: 2 }}>
                <Tabs
                    value={currentTab}
                    onChange={handleChangeTab}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab
                        icon={<CalendarMonth />}
                        label="Agenda"
                        iconPosition="start"
                    />
                    <Tab
                        icon={<Psychology />}
                        label="Especialidades"
                        iconPosition="start"
                    />
                    <Tab
                        icon={<AccessTime />}
                        label="Disponibilidade"
                        iconPosition="start"
                    />
                    <Tab
                        icon={<Description />}
                        label="Documentos"
                        iconPosition="start"
                    />
                </Tabs>
            </Paper>

            {/* Conteúdo das Tabs */}
            <TabPanel value={currentTab} index={0}>
                <TerapeutaCalendario
                    terapeuta={terapeuta}
                    onError={handleError}
                />
            </TabPanel>

            <TabPanel value={currentTab} index={1}>
                <TerapeutaAreasForm
                    terapeuta={terapeuta}
                    onSave={() => handleSuccess('Especialidades atualizadas com sucesso')}
                    onError={handleError}
                />
            </TabPanel>

            <TabPanel value={currentTab} index={2}>
                <TerapeutaDisponibilidade
                    terapeuta={terapeuta}
                    onSave={() => handleSuccess('Disponibilidade atualizada com sucesso')}
                    onError={handleError}
                />
            </TabPanel>

            <TabPanel value={currentTab} index={3}>
                <TerapeutaDocumentos
                    terapeuta={terapeuta}
                    onSuccess={(message) => handleSuccess(message)}
                    onError={handleError}
                />
            </TabPanel>
        </Box>
    );
};

export default TerapeutaDashboard;