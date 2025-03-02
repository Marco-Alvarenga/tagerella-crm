// src/client/components/Layout/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  People, 
  FitnessCenter,
  ShoppingCart, 
  Headphones, 
  Book,
  Assignment,
  AttachMoney 
} from '@mui/icons-material';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/', icon: <Home />, text: 'Dashboard' },
    { path: '/clients', icon: <People />, text: 'Clients' },
    { path: '/workouts', icon: <FitnessCenter />, text: 'Workouts' },
    { path: '/shop', icon: <ShoppingCart />, text: 'Shop' },
    { path: '/audio', icon: <Headphones />, text: 'Audio' },
    { path: '/blog', icon: <Book />, text: 'Blog' },
    { path: '/requests', icon: <Assignment />, text: 'Requests' },
    { path: '/billing', icon: <AttachMoney />, text: 'Billing' },
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white">
      <div className="p-4">
        <img src="/logo.svg" alt="Tagarella" className="h-8" />
      </div>
      <nav className="mt-8">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${
              location.pathname === item.path ? 'bg-gray-700 text-white' : ''
            }`}
          >
            <span className="mr-4">{item.icon}</span>
            <span>{item.text}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};
console.log(location.pathname)
export default Sidebar;