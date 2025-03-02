import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, IconButton } from '@mui/material';
import { Edit, Delete, Add, ChevronRight } from '@mui/icons-material';
import JogosForm from './JogosForm';
import.meta.env.VITE_API_URL; // Importe a variável de ambiente


const JogosList = () => {
    const [jogos, setJogos] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedJogo, setSelectedJogo] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchJogos();
    }, []);

    const fetchJogos = async () => {
        try {
			const baseUrl = import.meta.env.VITE_API_URL; // Use a variável aqui
            const response = await fetch('${baseUrl}/api/jogos');
            const data = await response.json();
            setJogos(data);
        } catch (error) {
            console.error('Error fetching jogos:', error.message);
        }
    };

    const handleEdit = (jogo) => {
        setSelectedJogo(jogo);
        setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this jogo?')) {
            try {
				const baseUrl = import.meta.env.VITE_API_URL; // Use a variável aqui
                await fetch(`${baseUrl}/api/jogos/${id}`, {
                    method: 'DELETE',
                });
                fetchJogos();
            } catch (error) {
                console.error('Error deleting jogo:', error.message);
            }
        }
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setSelectedJogo(null);
    };

    const handleFormSubmit = () => {
        fetchJogos();
        handleFormClose();
    };

    const handleNavigateToSubcategorias = (jogoId) => {
        navigate(`/jogos/${jogoId}/subcategorias`);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Jogos</h1>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setIsFormOpen(true)}
                >
                    Add New Jogo
                </Button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Descrição</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {jogos.map((jogo) => (
                        <tr key={jogo.id}>
                            <td>{jogo.nome}</td>
                            <td>{jogo.descricao}</td>
                            <td>
                                <IconButton onClick={() => handleEdit(jogo)} color="primary">
                                    <Edit />
                                </IconButton>
                                <IconButton onClick={() => handleDelete(jogo.id)} color="error">
                                    <Delete />
                                </IconButton>
                                <IconButton onClick={() => handleNavigateToSubcategorias(jogo.id)} color="default">
                                    <ChevronRight />
                                </IconButton>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {isFormOpen && (
                <JogosForm
                    open={isFormOpen}
                    onClose={handleFormClose}
                    onSubmit={handleFormSubmit}
                    jogo={selectedJogo}
                />
            )}
        </div>
    );
};

export default JogosList;
