// ============================================================
// main.jsx - Punto de Entrada de la Aplicación
// ============================================================
// Este archivo es el punto de entrada de la aplicación React
// Renderiza el componente App en el DOM
// ============================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// ============================================================
// Renderizar la aplicación
// ============================================================
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
