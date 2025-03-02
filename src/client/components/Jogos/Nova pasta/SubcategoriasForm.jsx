// src/client/components/Jogos/SubcategoriasForm.jsx
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

const SubcategoriasForm = ({ open, onClose, onSubmit, subcategoria, jogoId }) => {
    const [formData, setFormData] = useState({
        nome: ''
    });

    useEffect(() => {
        if (subcategoria) {
            setFormData(subcategoria);
        }
    }, [subcategoria]);

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
            const url = subcategoria
                ? `${baseUrl}/api/jogos/subcategorias/${subcategoria.id}`
                : `${baseUrl}/api/jogos/${jogoId}/subcategorias`;

            const response = await fetch(url, {
                method: subcategoria ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                onSubmit();
            }
        } catch (error) {
            console.error('Error saving subcategoria:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{subcategoria ? 'Edit Subcategoria' : 'Add New Subcategoria'}</DialogTitle>
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
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained" color="primary">
                        {subcategoria ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default SubcategoriasForm;
