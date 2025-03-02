// src/client/components/Jogos/JogoDetailConfig.jsx
import React from 'react';
import { FormControl, InputLabel, Box, Select, MenuItem, TextField, FormControlLabel, Switch } from '@mui/material';

const JogoDetailConfig = ({ formData, onChange }) => {
 const handleChange = (field, value) => {
   onChange({
     ...formData,
     [field]: value
   });
 };

 return (
   <Box className="p-4 space-y-4">
     <FormControl fullWidth>
       <InputLabel>Tipo de Jogo</InputLabel>
       <Select
         value={formData.jogo_tipo_id}
         onChange={(e) => handleChange('jogo_tipo_id', e.target.value)}
       >
         <MenuItem value={2}>Jogo de Cartas</MenuItem>
         <MenuItem value={1}>Jogo da Memória</MenuItem>
       </Select>
     </FormControl>

     <FormControlLabel
       control={
         <Switch
           checked={Boolean(formData.numbers)}
           onChange={(e) => handleChange('numbers', e.target.checked)}
         />
       }
       label="Mostrar números"
     />

     {formData.numbers && (
       <TextField
         fullWidth
         label="Cor dos números"
         value={formData.numbers_color || ''}
         onChange={(e) => handleChange('numbers_color', e.target.value)}
       />
     )}

     <FormControl fullWidth>
       <InputLabel>Tipo de Animação</InputLabel>
       <Select
         value={formData.animation_type || 'simples'}
         onChange={(e) => handleChange('animation_type', e.target.value)}
       >
         <MenuItem value="simples">Simples</MenuItem>
       </Select>
     </FormControl>

     <TextField
       fullWidth
       type="number"
       label="Número de Imagens"
       value={formData.n_imagens || 0}
       onChange={(e) => handleChange('n_imagens', parseInt(e.target.value))}
     />
   </Box>
 );
};

export default JogoDetailConfig;