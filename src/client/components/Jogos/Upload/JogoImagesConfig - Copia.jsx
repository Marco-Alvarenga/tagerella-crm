// src/client/components/Jogos/JogoImagesConfig.jsx
import React from 'react';
import SingleImageUpload from './SingleImageUpload';
import UploadArea from './UploadArea';

const JogoImagesConfig = ({ jogoId, formData, onChange }) => (
  <div className="space-y-4 p-4">
    <SingleImageUpload
      jogoId={jogoId}
      fieldName="screensaver"
      label="Descanso de tela"
      value={formData.screensaver}
      onChange={value => onChange({...formData, screensaver: value})}
    />
    
    <SingleImageUpload
      jogoId={jogoId}
      fieldName="background"
      label="Papel de parede"
      value={formData.background}
      onChange={value => onChange({...formData, background: value})}
    />

    <SingleImageUpload
      jogoId={jogoId}
      fieldName="coverimage"
      label="Verso da carta"
      value={formData.coverimage}
      onChange={value => onChange({...formData, coverimage: value})}
    />

    {jogoId && <UploadArea jogoId={jogoId} />}
  </div>
);

export default JogoImagesConfig;