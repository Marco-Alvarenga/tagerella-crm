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

const SubSubcategoriasForm = ({ open, onClose, onSubmit, subSubcategoria, subcategoriaId }) => {
    const [formData, setFormData] = useState({
        nome: ''
    });

    useEffect(() => {
        if (subSubcategoria) {
            setFormData(subSubcategoria);
        }
    }, [subSubcategoria]);

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
            const url = subSubcategoria
                ? `${baseUrl}/api/jogos/sub_subcategorias/${subSubcategoria.id}`
                : `${baseUrl}/api/jogos/subcategorias/${subcategoriaId}/sub_subcategorias`;

            const response = await fetch(url, {
                method: subSubcategoria ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                onSubmit();
            }
        } catch (error) {
            console.error('Error saving sub-subcategoria:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{subSubcategoria ? 'Edit Sub-Subcategoria' : 'Add New Sub-Subcategoria'}</DialogTitle>
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
                        {subSubcategoria ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default SubSubcategoriasForm;
