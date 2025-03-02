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
    Typography
} from '@mui/material';
import { Psychology } from '@mui/icons-material';
import { clientService } from '../../services/api';

const PromoteTerapeutaModal = ({ open, onClose, client, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        registro_numero: '',
        registro_sigla: '',
        registro_validade: '',
        profissao_id: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.registro_numero || !formData.registro_sigla || !formData.registro_validade) {
            setError('Por favor, preencha os campos obrigatórios');
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

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <Psychology color="primary" />
                    <span>Promover para Terapeuta</span>
                </Box>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Typography variant="body2" color="textSecondary" paragraph>
                        Você está promovendo <strong>{client?.nome}</strong> para terapeuta. 
                        Preencha as informações básicas abaixo. Após a promoção, você poderá 
                        completar as informações adicionais no cadastro de terapeutas.
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
                        InputLabelProps={{ shrink: true }}
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading && <CircularProgress size={20} />}
                    >
                        {loading ? 'Promovendo...' : 'Promover para Terapeuta'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default PromoteTerapeutaModal;