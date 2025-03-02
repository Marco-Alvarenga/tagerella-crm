// src/client/components/Jogos/JogosForm.jsx
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button
} from '@mui/material';
import.meta.env.VITE_API_URL; // Importe a variável de ambiente

const JogosForm = ({ open, onClose, onSubmit, jogo }) => {
    const [formData, setFormData] = useState({
        nome: '',
        descricao: ''
    });

    useEffect(() => {
        if (jogo) {
            setFormData(jogo);
        }
    }, [jogo]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
			const baseUrl = import.meta.env.VITE_API_URL; // Use a variável aqui
            const url = jogo
                ? `${baseUrl}/api/jogos/${jogo.id}`
                : '${baseUrl}/api/jogos';

            const response = await fetch(url, {
                method: jogo ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                onSubmit();
            }
        } catch (error) {
            console.error('Error saving jogo:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{jogo ? 'Edit Jogo' : 'Add New Jogo'}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <TextField
                        name="nome"
                        label="Nome"
                        value={formData.nome}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                    />
                    <TextField
                        name="descricao"
                        label="Descrição"
                        value={formData.descricao}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={4}
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained" color="primary">
                        {jogo ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default JogosForm;
