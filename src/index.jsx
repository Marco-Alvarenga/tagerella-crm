// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './client/App';
import './client/styles/main.css';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);