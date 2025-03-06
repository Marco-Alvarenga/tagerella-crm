// src/client/components/Jogos/UploadArea.jsx
import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardMedia, Button, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const UploadArea = ({ jogoId, images = [], onImagesChange }) => {
 const [files, setFiles] = useState([]);

 const handleFileSelect = (event) => {
   setFiles(Array.from(event.target.files));
 };

 const handleUpload = async () => {
    if (!files.length || !jogoId) return;

  console.log('Iniciando upload de arquivos:', files);

   const formData = new FormData();
   files.forEach(file => formData.append('images', file));

   try {
     const response = await fetch(`/api/upload/multiple/${jogoId}`, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${localStorage.getItem('token')}`
       },
       body: formData
     });

     if (response.ok) {
      const data = await response.json();
      console.log('Resposta do servidor após upload:', data);
      console.log('Valor atual de images:', images);
      onImagesChange([...images, ...data.files]);
      console.log('Novo valor de images após atualização:', [...images, ...data.files]);
      setFiles([]);
    } else {
      console.error('Erro na resposta do servidor:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Detalhes do erro:', errorText);
    }
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload das imagens: ' + error.message);
    }
  };

 const handleRemove = (index) => {
   const newImages = [...images];
   newImages.splice(index, 1);
   onImagesChange(newImages);
 };

 return (
   <Box className="border p-4 mt-4">
     <Typography variant="h6" gutterBottom>Cards</Typography>
     <Grid container spacing={2}>
       {Array.isArray(images) && images.map((image, index) => (
         <Grid item xs={2} key={index}>
           <Card>
             <CardMedia
               component="img"
               height="140"
               image={image}
               alt={`Card ${index + 1}`}
             />
             <IconButton
               size="small"
               onClick={() => handleRemove(index)}
               sx={{ position: 'absolute', top: 4, right: 4 }}
             >
               <DeleteIcon />
             </IconButton>
           </Card>
         </Grid>
       ))}
     </Grid>
     
     <Box className="mt-4 flex justify-between items-center">
       <div>
         {files.length} arquivos selecionados
       </div>
       <div className="flex gap-2">
         <input
           type="file"
           multiple
           accept="image/*"
           onChange={handleFileSelect}
           hidden
           id="card-upload"
         />
         <Button
           component="label"
           htmlFor="card-upload"
           variant="contained"
         >
           Selecionar
         </Button>
         {files.length > 0 && (
           <Button
             variant="contained"
             onClick={handleUpload}
           >
             Upload
           </Button>
         )}
       </div>
     </Box>
   </Box>
 );
};

export default UploadArea;
