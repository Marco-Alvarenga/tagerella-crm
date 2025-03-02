// src/client/components/Clients/PromoteTerapeutaModal.jsx
import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Alert,
    CircularProgress,
    Typography,
    Stepper,
    Step,
    StepLabel
} from '@mui/material';
import { Psychology } from '@mui/icons-material';
import { clientService } from '../../services/api';
import ProfessionSelect from '../Common/ProfessionSelect';

const steps = ['Confirmar Promoção', 'Dados Profissionais'];

const PromoteTerapeutaModal = ({ open, onClose, client, onSuccess }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        registro_numero: '',
        registro_sigla: '',
        registro_validade: '',
        profissao_id: ''
    });

    const handleNext = () => {
        if (activeStep === 0) {
            // Validar primeira etapa
            if (!formData.profissao_id) {
                setError('Selecione a profissão');
                return;
            }
            setActiveStep(1);
            setError('');
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
        setError('');
    };

    const handleSubmit = async () => {
        if (!formData.registro_numero || !formData.registro_sigla || !formData.registro_validade) {
            setError('Preencha todos os campos obrigatórios');
            return;
        }

        try {
            setLoading(true);
            await clientService.promoteToTerapeuta(client.usuario_id, formData);
            onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <>
                        <Typography variant="body2" color="textSecondary" paragraph>
                            Você está promovendo <strong>{client?.nome}</strong> para terapeuta. 
                            Primeiro, selecione a profissão do terapeuta:
                        </Typography>

                        <ProfessionSelect
                            value={formData.profissao_id}
                            onChange={(e) => setFormData({
                                ...formData,
                                profissao_id: e.target.value
                            })}
                            required
                            error={!!error && !formData.profissao_id}
                        />
                    </>
                );

            case 1:
                return (
                    <>
                        <Typography variant="body2" color="textSecondary" paragraph>
                            Agora, preencha as informações do registro profissional:
                        </Typography>

                        <TextField
                            label="Número do Registro"
                            value={formData.registro_numero}
                            onChange={(e) => setFormData({
                                ...formData,
                                registro_numero: e.target.value
                            })}
                            fullWidth
                            margin="normal"
                            required
                            error={!!error && !formData.registro_numero}
                        />

                        <TextField
                            label="Sigla do Conselho"
                            value={formData.registro_sigla}
                            onChange={(e) => setFormData({
                                ...formData,
                                registro_sigla: e.target.value
                            })}
                            fullWidth
                            margin="normal"
                            required
                            error={!!error && !formData.registro_sigla}
                            placeholder="Ex: CRP, CRM"
                        />

                        <TextField
                            label="Validade do Registro"
                            type="date"
                            value={formData.registro_validade}
                            onChange={(e) => setFormData({
                                ...formData,
                                registro_validade: e.target.value
                            })}
                            fullWidth
                            margin="normal"
                            required
                            error={!!error && !formData.registro_validade}
                            InputLabelProps={{ shrink: true }}
                        />
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <Psychology color="primary" />
                    <span>Promover para Terapeuta</span>
                </Box>
            </DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {renderStepContent(activeStep)}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancelar
                </Button>
                
                {activeStep > 0 && (
                    <Button onClick={handleBack} disabled={loading}>
                        Voltar
                    </Button>
                )}

                <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20} />}
                >
                    {loading ? 'Processando...' : activeStep === steps.length - 1 ? 'Concluir' : 'Próximo'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PromoteTerapeutaModal;