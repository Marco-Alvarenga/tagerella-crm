import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, IconButton } from '@mui/material';
import { Edit, Delete, Add, ChevronRight } from '@mui/icons-material';
import SubcategoriasForm from './SubcategoriasForm';
import.meta.env.VITE_API_URL; // Importe a variável de ambiente

const SubcategoriasList = () => {
  const { jogoId } = useParams();
  const [subcategorias, setSubcategorias] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSubcategoria, setSelectedSubcategoria] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubcategorias();
  }, [jogoId]);

  const fetchSubcategorias = async () => {
    try {
	  const baseUrl = import.meta.env.VITE_API_URL; // Use a variável aqui	
      const response = await fetch(`${baseUrl}/api/jogos/${jogoId}/subcategorias`);
      const data = await response.json();
      setSubcategorias(data);
    } catch (error) {
      console.error('Error fetching subcategorias:', error.message);
    }
  };

  const handleEdit = (subcategoria) => {
    setSelectedSubcategoria(subcategoria);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subcategoria?')) {
      try {
		const baseUrl = import.meta.env.VITE_API_URL; // Use a variável aqui  
        await fetch(`${baseUrl}/api/jogos/subcategorias/${id}`, {
          method: 'DELETE',
        });
        fetchSubcategorias();
      } catch (error) {
        console.error('Error deleting subcategoria:', error.message);
      }
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedSubcategoria(null);
  };

  const handleFormSubmit = () => {
    fetchSubcategorias();
    handleFormClose();
  };

  const handleNavigateToSubSubcategorias = (subcategoriaId) => {
    navigate(`/subcategorias/${subcategoriaId}/sub_subcategorias`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Subcategorias</h1>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsFormOpen(true)}
        >
          Add New Subcategoria
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
          {subcategorias.map((subcategoria) => (
            <tr key={subcategoria.id}>
              <td>{subcategoria.nome}</td>
              <td>
                <IconButton onClick={() => handleEdit(subcategoria)} color="primary">
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(subcategoria.id)} color="error">
                  <Delete />
                </IconButton>
                <IconButton onClick={() => handleNavigateToSubSubcategorias(subcategoria.id)} color="default">
                  <ChevronRight />
                </IconButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isFormOpen && (
        <SubcategoriasForm
          open={isFormOpen}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          subcategoria={selectedSubcategoria}
          jogoId={jogoId}
        />
      )}
    </div>
  );
};

export default SubcategoriasList;
