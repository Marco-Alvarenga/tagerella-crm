import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button, IconButton } from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import InformacoesForm from './InformacoesForm';
import.meta.env.VITE_API_URL; // Importe a variável de ambiente


const InformacoesList = () => {
    const { subSubcategoriaId } = useParams();
    const [informacoes, setInformacoes] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedInformacao, setSelectedInformacao] = useState(null);

    useEffect(() => {
        fetchInformacoes();
    }, [subSubcategoriaId]);

    const fetchInformacoes = async () => {
        try {
			const baseUrl = import.meta.env.VITE_API_URL; // Use a variável aqui
            const response = await fetch(`${baseUrl}/api/jogos/sub_subcategorias/${subSubcategoriaId}/informacoes`);
            const data = await response.json();
            setInformacoes(data);
        } catch (error) {
            console.error('Error fetching informacoes:', error.message);
        }
    };

    const handleEdit = (informacao) => {
        setSelectedInformacao(informacao);
        setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this informacao?')) {
            try {
				const baseUrl = import.meta.env.VITE_API_URL; // Use a variável aqui
                await fetch(`${baseUrl}/api/informacoes/${id}`, {
                    method: 'DELETE',
                });
                fetchInformacoes();
            } catch (error) {
                console.error('Error deleting informacao:', error.message);
            }
        }
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setSelectedInformacao(null);
    };

    const handleFormSubmit = () => {
        fetchInformacoes();
        handleFormClose();
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Informações dos Jogos</h1>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setIsFormOpen(true)}
                >
                    Add New Informacao
                </Button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Tipo</th>
                        <th>Conteúdo</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {informacoes.map((informacao) => (
                        <tr key={informacao.id}>
                            <td>{informacao.tipo}</td>
                            <td>{informacao.conteudo}</td>
                            <td>
                                <IconButton onClick={() => handleEdit(informacao)} color="primary">
                                    <Edit />
                                </IconButton>
                                <IconButton onClick={() => handleDelete(informacao.id)} color="error">
                                    <Delete />
                                </IconButton>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {isFormOpen && (
                <InformacoesForm
                    open={isFormOpen}
                    onClose={handleFormClose}
                    onSubmit={handleFormSubmit}
                    informacao={selectedInformacao}
                    subSubcategoriaId={subSubcategoriaId}
                />
            )}
        </div>
    );
};

export default InformacoesList;
