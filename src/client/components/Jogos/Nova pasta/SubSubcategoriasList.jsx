import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, IconButton } from '@mui/material';
import { Edit, Delete, Add, ChevronRight } from '@mui/icons-material';
import SubSubcategoriasForm from './SubSubcategoriasForm';
import.meta.env.VITE_API_URL; // Importe a variável de ambiente

const SubSubcategoriasList = () => {
    const { subcategoriaId } = useParams();
    const [subSubcategorias, setSubSubcategorias] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedSubSubcategoria, setSelectedSubSubcategoria] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSubSubcategorias();
    }, [subcategoriaId]);

    const fetchSubSubcategorias = async () => {
        try {
			const baseUrl = import.meta.env.VITE_API_URL; // Use a variável aqui
            const response = await fetch(`${baseUrl}/api/jogos/subcategorias/${subcategoriaId}/sub_subcategorias`);
            const data = await response.json();
            setSubSubcategorias(data);
        } catch (error) {
            console.error('Error fetching sub-subcategorias:', error.message);
        }
    };

    const handleEdit = (subSubcategoria) => {
        setSelectedSubSubcategoria(subSubcategoria);
        setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this sub-subcategoria?')) {
            try {
				const baseUrl = import.meta.env.VITE_API_URL; // Use a variável aqui
                await fetch(`${baseUrl}/api/jogos/sub_subcategorias/${id}`, {
                    method: 'DELETE',
                });
                fetchSubSubcategorias();
            } catch (error) {
                console.error('Error deleting sub-subcategoria:', error.message);
            }
        }
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setSelectedSubSubcategoria(null);
    };

    const handleFormSubmit = () => {
        fetchSubSubcategorias();
        handleFormClose();
    };

    const handleNavigateToInformacoes = (subSubcategoriaId) => {
        navigate(`/sub_subcategorias/${subSubcategoriaId}/informacoes`);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Sub-Subcategorias</h1>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setIsFormOpen(true)}
                >
                    Add New Sub-Subcategoria
                </Button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {subSubcategorias.map((subSubcategoria) => (
                        <tr key={subSubcategoria.id}>
                            <td>{subSubcategoria.nome}</td>
                            <td>
                                <IconButton onClick={() => handleEdit(subSubcategoria)} color="primary">
                                    <Edit />
                                </IconButton>
                                <IconButton onClick={() => handleDelete(subSubcategoria.id)} color="error">
                                    <Delete />
                                </IconButton>
                                <IconButton onClick={() => handleNavigateToInformacoes(subSubcategoria.id)} color="default">
                                    <ChevronRight />
                                </IconButton>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {isFormOpen && (
                <SubSubcategoriasForm
                    open={isFormOpen}
                    onClose={handleFormClose}
                    onSubmit={handleFormSubmit}
                    subSubcategoria={selectedSubSubcategoria}
                    subcategoriaId={subcategoriaId}
                />
            )}
        </div>
    );
};

export default SubSubcategoriasList;
