// src/client/components/Jogos/InformacoesForm.jsx
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Tabs,
    Tab,
    Box
} from '@mui/material';
import.meta.env.VITE_API_URL; // Importe a variável de ambiente


const InformacoesForm = ({ open, onClose, onSubmit, informacao, subSubcategoriaId }) => {
    const [formData, setFormData] = useState({
        tipo: '',
        conteudo: ''
    });
    const [tabIndex, setTabIndex] = useState(0);

    useEffect(() => {
        if (informacao) {
            setFormData(informacao);
        }
    }, [informacao]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
			const baseUrl = import.meta.env.VITE_API_URL; // Use a variável aqui
            const url = informacao
                ? `${baseUrl}/api/jogos/informacoes/${informacao.id}`
                : `${baseUrl}/api/jogos/sub_subcategorias/${subSubcategoriaId}/informacoes`;

            const response = await fetch(url, {
                method: informacao ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                onSubmit();
            }
        } catch (error) {
            console.error('Error saving informacao:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{informacao ? 'Edit Informacao' : 'Add New Informacao'}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Tabs value={tabIndex} onChange={handleTabChange}>
                        <Tab label="Primeira Aba" />
                        <Tab label="Segunda Aba" />
                        <Tab label="Terceira Aba" />
                    </Tabs>
                    <Box hidden={tabIndex !== 0}>
                        <TextField
                            name="tipo"
                            label="Tipo"
                            value={formData.tipo}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                        />
                    </Box>
                    <Box hidden={tabIndex !== 1}>
                        <TextField
                            name="conteudo"
                            label="Conteúdo"
                            value={formData.conteudo}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={4}
                            margin="normal"
                        />
                    </Box>
                    <Box hidden={tabIndex !== 2}>
                        {/* Adicione outros campos necessários para a terceira aba */}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained" color="primary">
                        {informacao ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default InformacoesForm;
