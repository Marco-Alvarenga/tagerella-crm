// src/client/components/Clients/ClientForm.jsx 
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Alert,
    FormControlLabel,
    Checkbox,
    IconButton,
    Tooltip,
    CircularProgress
} from '@mui/material';
import { Close, Visibility, VisibilityOff } from '@mui/icons-material';
import { clientService } from '../../services/api';

const ClientForm = ({ open, onClose, onSubmit, client }) => {
    // Estados principais
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: '',
        telefone: '',
        nome_paciente: '',
        responsavel: false
    });

    // Estados para senha
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Estados de UI
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    // Inicializar form com dados do cliente se estiver editando
    useEffect(() => {
        if (client) {
            setFormData({
                nome: client.nome || '',
                email: client.email || '',
                senha: '',
                telefone: client.telefone || '',
                nome_paciente: client.nome_paciente || '',
                responsavel: client.responsavel || false
            });
        }
    }, [client]);

    // Validação do formulário
    const validateForm = () => {
        const newErrors = {};

        // Validar nome
        if (!formData.nome.trim()) {
            newErrors.nome = 'Nome é obrigatório';
        }

        // Validar email
        if (!formData.email.trim()) {
            newErrors.email = 'Email é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        // Validar senha para novo cliente
        if (!client && !formData.senha) {
            newErrors.senha = 'Senha é obrigatória para novo cliente';
        } else if (formData.senha) {
            // Validar complexidade da senha
            if (formData.senha.length < 8) {
                newErrors.senha = 'Senha deve ter no mínimo 8 caracteres';
            } else if (!/[A-Z]/.test(formData.senha)) {
                newErrors.senha = 'Senha deve conter pelo menos uma letra maiúscula';
            } else if (!/[a-z]/.test(formData.senha)) {
                newErrors.senha = 'Senha deve conter pelo menos uma letra minúscula';
            } else if (!/[0-9]/.test(formData.senha)) {
                newErrors.senha = 'Senha deve conter pelo menos um número';
            } else if (!/[!@#$%^&*]/.test(formData.senha)) {
                newErrors.senha = 'Senha deve conter pelo menos um caractere especial (!@#$%^&*)';
            }

            // Validar confirmação de senha
            if (formData.senha !== confirmPassword) {
                newErrors.confirmPassword = 'As senhas não coincidem';
            }
        }

        // Validar telefone (opcional mas com formato)
        if (formData.telefone && !/^\(\d{2}\) \d{4,5}-\d{4}$/.test(formData.telefone)) {
            newErrors.telefone = 'Formato inválido. Use (99) 99999-9999';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handler para mudança nos campos
    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        const newValue = e.target.type === 'checkbox' ? checked : value;

        // Formatação automática do telefone
        if (name === 'telefone') {
            const telefoneFormatado = value
                .replace(/\D/g, '')
                .replace(/^(\d{2})(\d)/g, '($1) $2')
                .replace(/(\d)(\d{4})$/, '$1-$2')
                .slice(0, 15);
            
            setFormData(prev => ({ ...prev, telefone: telefoneFormatado }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: newValue }));
        // Limpar erro do campo quando ele for alterado
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Submit do formulário
    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        
        if (!validateForm()) return;

        try {
            setLoading(true);
            if (client) {
                await clientService.updateClient(client.usuario_id, formData);
            } else {
                await clientService.createClient(formData);
            }
            onSubmit();
        } catch (error) {
            setApiError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <span>{client ? 'Editar Cliente' : 'Novo Cliente'}</span>
                    <IconButton onClick={onClose} size="small">
                        <Close />
                    </IconButton>
                </Box>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent>
                    {apiError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {apiError}
                        </Alert>
                    )}

                    <TextField
                        name="nome"
                        label="Nome"
                        value={formData.nome}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        error={!!errors.nome}
                        helperText={errors.nome}
                    />

                    <TextField
                        name="email"
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        error={!!errors.email}
                        helperText={errors.email}
                    />

                    {(!client || formData.senha) && (
                        <>
                            <TextField
                                name="senha"
                                label="Senha"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.senha}
                                onChange={handleChange}
                                fullWidth
                                margin="normal"
                                error={!!errors.senha}
                                helperText={errors.senha}
                                InputProps={{
                                    endAdornment: (
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    )
                                }}
                            />

                            <TextField
                                name="confirmPassword"
                                label="Confirmar Senha"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                fullWidth
                                margin="normal"
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword}
                                InputProps={{
                                    endAdornment: (
                                        <IconButton
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            edge="end"
                                        >
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    )
                                }}
                            />
                        </>
                    )}

                    <TextField
                        name="telefone"
                        label="Telefone"
                        value={formData.telefone}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        error={!!errors.telefone}
                        helperText={errors.telefone || 'Formato: (99) 99999-9999'}
                    />

                    <TextField
                        name="nome_paciente"
                        label="Nome do Paciente"
                        value={formData.nome_paciente}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                name="responsavel"
                                checked={formData.responsavel}
                                onChange={handleChange}
                            />
                        }
                        label="É responsável"
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
                        {loading ? 'Salvando...' : (client ? 'Atualizar' : 'Criar')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ClientForm;