// src/client/components/Jogos/MenuForm.jsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';

const MenuForm = ({ open, onClose, onSuccess, menu, parentId }) => {
  const [formData, setFormData] = useState({
    nome: '',
    ordem: 0,
    tipo: 'pasta',
    menu_superior_id: parentId || null
  });

  useEffect(() => {
    if (menu) {
      setFormData({
        nome: menu.nome,
        ordem: menu.ordem,
        tipo: menu.tipo,
        menu_superior_id: menu.menu_superior_id
      });
    } else {
      setFormData({
        nome: '',
        ordem: 0,
        tipo: 'pasta',
        menu_superior_id: parentId || null  // Reset com parentId
      });
    }
  }, [menu, open, parentId]);

  const onCloseForm = () => {
    setFormData(initialState);
    onClose();
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const url = menu ? `/api/jogos/menu/${menu.menu_id}` : '/api/jogos/menu';
    const method = menu ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        ...formData,
        menu_superior_id: parentId
      })
    });

    if (response.ok) onSuccess();
  } catch (error) {
    console.error(error);
  }
};

 return (
       <Dialog open={open} onClose={onCloseForm} maxWidth="sm" fullWidth>
      <DialogTitle>{menu ? 'Editar Menu' : 'Novo Menu'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            fullWidth
            label="Nome"
            value={formData.nome}
            onChange={e => setFormData({...formData, nome: e.target.value})}
            required
			margin="normal"
          />
          <TextField
            fullWidth
            type="number"
            label="Ordem"
            value={formData.ordem}
            onChange={e => setFormData({...formData, ordem: e.target.value})}
            required
			margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo</InputLabel>
            <Select
              value={formData.tipo}
              onChange={e => setFormData({...formData, tipo: e.target.value})}
            >
              <MenuItem value="pasta">Pasta</MenuItem>
              <MenuItem value="jogo">Jogo</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained">Salvar</Button>
        </DialogActions>
      </form>
    </Dialog>
 );
};

export default MenuForm;