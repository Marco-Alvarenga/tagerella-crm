// src/client/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './components/Dashboard/Dashboard';
import ClientList from './components/Clients/ClientList';
import TerapeutaList from './components/Terapeuta/TerapeutaList';
import TerapeutaDashboard from './components/Terapeuta/TerapeutaDashboard';
import TerapeutaAgenda from './components/Terapeuta/TerapeutaAgenda';
import TerapeutaDocumentos from './components/Terapeuta/TerapeutaDocumentos';
import MenuList from './components/Jogos/MenuList';
import ImageUpload from './components/form';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoginForm from './components/Auth/LoginForm';
import { Outlet } from 'react-router-dom';

// Placeholder component for dashboard
const DashboardPlaceholder = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
    <p>Tagarella CRM</p>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route element={<ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/form" element={<ImageUpload />} />
          <Route path="/clients" element={<ClientList />} />
          <Route path="/terapeutas" element={<TerapeutaList />} />
		  <Route path="/terapeutas/:id" element={<TerapeutaDashboard />} />
		  <Route path="/terapeutas/:id/agenda" element={<TerapeutaAgenda />} />
		  <Route path="/terapeutas/:id/documentos" element={<TerapeutaDocumentos />} />
          <Route path="/workouts/material/jogos" element={<MenuList />} />
		  <Route path="/jogos/menu/:parentId" element={<MenuList />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
