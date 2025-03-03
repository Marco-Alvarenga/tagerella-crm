// src/client/components/Jogos/JogoConfigForm.jsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Tabs, Tab, Box } from '@mui/material';
import JogoDetailConfig from './JogoDetailConfig';
import JogoImagesConfig from './JogoImagesConfig';

const JogoConfigForm = ({ open, onClose, onSuccess, menu }) => {
 const [tabIndex, setTabIndex] = useState(0);
 const [formData, setFormData] = useState({
   jogo_tipo_id: 2, // Default para cartas
   numbers: false,
   numbers_color: 'FFFFFF',
   n_imagens: 0,
   animation_type: 'simples',
   screensaver: '',
   background: '',
   coverimage: '',
   conteudo: []
 });

 useEffect(() => {
   if (menu?.menu_id) {
     fetchJogoConfig();
   }
 }, [menu]);

 const fetchJogoConfig = async () => {
   try {

    // Vamos adicionar logs para debug
    console.log(`Buscando configuração para o menu_id: ${menu?.menu_id}`);

     const response = await fetch(`/api/jogos/${menu.menu_id}/config`, {
       headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
     });

    // Verificar resposta para debugar
    const text = await response.text(); // Obter o texto da resposta
    console.log('Resposta bruta:', text);
    
    try {
      // Tentar converter para JSON
      const data = JSON.parse(text);
       setFormData({
         ...formData,
         ...data,
         jogo_tipo_id: data.jogo_tipo_id || 2,
         numbers: Boolean(data.numbers),
         conteudo: data.conteudo || []
       });
    } catch (jsonError) {
      console.error('Erro ao parsear JSON:', jsonError);
      // Verifica se a resposta contém HTML, o que indicaria um erro de rota
      if (text.includes('<!DOCTYPE html>') || text.includes('<!-- ')) {
        console.error('Recebeu HTML em vez de JSON. Verifique se a rota da API está correta e se o proxy está configurado corretamente.');
      }
    }
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
  }
};

 const handleSubmit = async (e) => {
   e.preventDefault();
   try {
     const response = await fetch(`/api/jogos/${menu.menu_id}/config`, {
       method: 'PUT',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${localStorage.getItem('token')}`
       },
       body: JSON.stringify(formData)
     });

     if (!response.ok) throw new Error('Erro ao salvar configuração');
     onSuccess();
     onClose();
   } catch (error) {
     console.error('Erro ao salvar:', error);
     alert(error.message);
   }
 };


  return (
   <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
     <DialogTitle>Configurar Jogo: {menu?.nome}</DialogTitle>
     <form onSubmit={handleSubmit}>
       <DialogContent>
         <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)}>
           <Tab label="Detalhes" />
           <Tab label="Imagens" />
         </Tabs>

         {tabIndex === 0 && (
           <JogoDetailConfig 
             formData={formData} 
             onChange={setFormData} 
           />
         )}

         {tabIndex === 1 && (
           <JogoImagesConfig 
             formData={formData} 
             onChange={setFormData}
             jogoId={menu?.menu_id}
           />
         )}
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
