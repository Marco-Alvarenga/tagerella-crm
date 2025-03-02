// src/client/components/Layout/MainLayout.jsx
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="p-6 bg-gray-100 flex-1 overflow-auto">
         <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;