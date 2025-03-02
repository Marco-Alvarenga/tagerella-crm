// src/client/components/Jogos/JogoConfigForm.jsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Tabs, Tab, Box } from '@mui/material';
import { JogoDetailConfig, JogoImagesConfig } from './JogoConfigParts';

const JogoConfigForm = ({ open, onClose, onSuccess, jogo }) => {
 const [tabIndex, setTabIndex] = useState(0);
 const [formData, setFormData] = useState({
   nome: jogo?.nome || '',
   sort: jogo?.sort || 0,
   tipojogo: jogo?.tipojogo || 'cartas',
   screensaver: '',
   background: '',
   coverimage: '',
   animationtype: 'simples',
   numbers: 'true',
   numberscolor: 'FFFFFF'
 });

 useEffect(() => {
   if (jogo) fetchJogoConfig();
 }, [jogo]);

 const fetchJogoConfig = async () => {
   const response = await fetch(`/api/jogos/${jogo.jogo_id}/config`);
   if (response.ok) {
     const config = await response.json();
     setFormData(prev => ({ ...prev, ...config }));
   }
 };

 const handleSubmit = async (e) => {
   e.preventDefault();
   const response = await fetch(`/api/jogos/${jogo.jogo_id}/config`, {
     method: 'PUT',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(formData)
   });
   if (response.ok) onSuccess();
 };

 return (
   <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
     <DialogTitle>Configurar Jogo: {jogo?.nome}</DialogTitle>
     <form onSubmit={handleSubmit}>
       <DialogContent>
         <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)}>
           <Tab label="Detalhes" />
           <Tab label="Imagens" />
         </Tabs>

         <Box hidden={tabIndex !== 0}>
           <JogoDetailConfig formData={formData} onChange={setFormData} />
         </Box>

         <Box hidden={tabIndex !== 1}>
           <JogoImagesConfig jogoId={jogo?.jogo_id} formData={formData} onChange={setFormData} />
         </Box>
       </DialogContent>
       <DialogActions>
         <Button onClick={onClose}>Cancelar</Button>
         <Button type="submit" variant="contained">Salvar</Button>
       </DialogActions>
     </form>
   </Dialog>
 );
};

export default JogoConfigForm;