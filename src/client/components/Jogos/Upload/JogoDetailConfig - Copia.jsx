// src/client/components/Jogos/JogoDetailConfig.jsx
import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';

const JogoDetailConfig = ({ formData, onChange }) => (
  <div className="space-y-4 p-4">
    <FormControl fullWidth margin="normal">
      <InputLabel>Tipo de Jogo</InputLabel>
      <Select
        value={formData.tipojogo}
        onChange={e => onChange({...formData, tipojogo: e.target.value})}
      >
        <MenuItem value="cartas">Cartas</MenuItem>
        <MenuItem value="memo">Memória</MenuItem>
        <MenuItem value="sorting">Sorting</MenuItem>
        <MenuItem value="combine">Combine</MenuItem>
        <MenuItem value="combine_t">Combine TPAC</MenuItem>
        <MenuItem value="encontre">Encontre</MenuItem>
        <MenuItem value="encontre_t">Encontre TPAC</MenuItem>
      </Select>
    </FormControl>

    <FormControl fullWidth margin="normal">
      <InputLabel>Tipo de animação</InputLabel>
      <Select
        value={formData.animationtype}
        onChange={e => onChange({...formData, animationtype: e.target.value})}
      >
        <MenuItem value="simples">Simples</MenuItem>
      </Select>
    </FormControl>

    <FormControl fullWidth margin="normal">
      <InputLabel>Números</InputLabel>
      <Select
        value={formData.numbers}
        onChange={e => onChange({...formData, numbers: e.target.value})}
      >
        <MenuItem value="true">Show</MenuItem>
        <MenuItem value="false">Hide</MenuItem>
      </Select>
    </FormControl>

    <TextField
      fullWidth
      label="Cor dos números"
      value={formData.numberscolor}
      onChange={e => onChange({...formData, numberscolor: e.target.value})}
      margin="normal"
    />
  </div>
);

export default JogoDetailConfig;