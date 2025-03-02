// componente.jsx
import React, { useState } from 'react';
import axios from 'axios';

function UploadForm({ baseId }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);

    // Gera previews
    const filePreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(filePreviews);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await axios.post(`/api/upload/${baseId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      console.log(response.data);
      // Limpa previews após upload
      setPreviews([]);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Erro no upload', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="file" 
        multiple 
        accept="image/*" 
        onChange={handleFileChange} 
      />
      
      <div style={{ display: 'flex', gap: '10px' }}>
        {previews.map((preview, index) => (
          <img 
            key={index} 
            src={preview} 
            alt={`Preview ${index}`} 
            style={{ 
              width: '100px', 
              height: '100px', 
              objectFit: 'cover' 
            }} 
          />
        ))}
      </div>
      
      <button type="submit" disabled={selectedFiles.length === 0}>
        Upload
      </button>
    </form>
  );
}

export default UploadForm;