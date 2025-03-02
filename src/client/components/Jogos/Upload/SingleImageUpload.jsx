// src/client/components/Jogos/SingleImageUpload.jsx
import React from 'react';
import { Box, TextField, Button } from '@mui/material';

const SingleImageUpload = ({ jogoId, fieldName, label, value, onChange }) => {
 const handleFileSelect = async (event) => {
   const file = event.target.files[0];
   if (!file || !jogoId) return;

   const formData = new FormData();
   formData.append('image', file);

   try {
     const response = await fetch(`/api/upload/single/${jogoId}`, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${localStorage.getItem('token')}`
       },
       body: formData
     });

     if (response.ok) {
       const data = await response.json();
       onChange(data.path);
     } else {
       throw new Error('Erro no upload');
     }
   } catch (error) {
     console.error('Erro:', error);
     alert('Erro ao fazer upload da imagem');
   }
 };

 return (
   <Box className="flex items-center gap-2">
     <TextField
       fullWidth
       label={label}
       value={value || ''}
       InputProps={{ readOnly: true }}
     />
     <input
       type="file"
       accept="image/*"
       onChange={handleFileSelect}
       hidden
       id={`file-input-${fieldName}`}
     />
     <Button
       component="label"
       htmlFor={`file-input-${fieldName}`}
       variant="outlined"
       size="small"
     >
       Escolher
     </Button>
     <Button
       variant="outlined"
       size="small"
       onClick={() => onChange('')}
     >
       Limpar
     </Button>
   </Box>
 );
};

export default SingleImageUpload;