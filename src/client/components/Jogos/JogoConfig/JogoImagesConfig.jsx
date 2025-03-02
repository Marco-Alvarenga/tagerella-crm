// src/client/components/Jogos/JogoImagesConfig.jsx
import React from 'react';
import { Box } from '@mui/material';
import SingleImageUpload from '../Upload/SingleImageUpload';
import UploadArea from '../Upload/UploadArea';

const JogoImagesConfig = ({ formData, onChange, jogoId }) => {
 const handleImageChange = (field, value) => {
   onChange({
     ...formData,
     [field]: value
   });
 };

 return (
   <Box className="p-4 space-y-4">
     <SingleImageUpload
       jogoId={jogoId}
       fieldName="screensaver"
       label="Descanso de tela"
       value={formData.screensaver}
       onChange={(value) => handleImageChange('screensaver', value)}
     />
     
     <SingleImageUpload
       jogoId={jogoId}
       fieldName="background"
       label="Papel de parede"
       value={formData.background}
       onChange={(value) => handleImageChange('background', value)}
     />
     
     <SingleImageUpload
       jogoId={jogoId}
       fieldName="coverimage"
       label="Verso da carta"
       value={formData.coverimage}
       onChange={(value) => handleImageChange('coverimage', value)}
     />

     <UploadArea 
       jogoId={jogoId} 
       images={formData.conteudo || []}
       onImagesChange={(images) => handleImageChange('conteudo', images)}
     />
   </Box>
 );
};

export default JogoImagesConfig;