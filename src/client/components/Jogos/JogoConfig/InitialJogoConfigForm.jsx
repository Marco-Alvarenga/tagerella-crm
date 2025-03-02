// src/client/components/Jogos/InitialJogoConfigForm.jsx
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const InitialJogoConfigForm = ({ open, onClose, onSuccess, menu }) => {
  const [tipoJogo, setTipoJogo] = useState('cartas');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/jogos/init-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          menu_id: menu.menu_id,
          tipo_jogo: tipoJogo
        })
      });
      
      if (response.ok) onSuccess();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Configuração Inicial do Jogo</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel>Tipo de Jogo</InputLabel>
            <Select
              value={tipoJogo}
              onChange={(e) => setTipoJogo(e.target.value)}
            >
              <MenuItem value="cartas">Cartas</MenuItem>
              <MenuItem value="memoria">Memória</MenuItem>
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

export default InitialJogoConfigForm;