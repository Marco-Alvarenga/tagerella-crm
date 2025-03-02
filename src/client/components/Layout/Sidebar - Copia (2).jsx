import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  People, 
  FitnessCenter,
  ShoppingCart, 
  Headphones, 
  Book,
  Assignment,
  AttachMoney,
  ChevronRight,
  ExpandMore
} from '@mui/icons-material';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [workoutsOpen, setWorkoutsOpen] = useState(false);
  const [materialOpen, setMaterialOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  

  const menuItems = [
    { path: '/', icon: <Home />, text: 'Dashboard' },
    { path: '/clients', icon: <People />, text: 'Clients' },
    { 
      path: '/workouts', 
      icon: <FitnessCenter />, 
      text: 'Workouts', 
      subItems: [
        { path: '/workouts/sessoes', text: 'Sessões' },
        { path: '/workouts/pagamentos', text: 'Pagamentos' },
        { path: '/workouts/ocorrencias', text: 'Ocorrencias' },
        { path: '/workouts/material', text: 'Material',
      subItems: [
        { path: '/workouts/avaliacao', text: 'Avaliaç]ao' },
		{ path: '/workouts/terapia', text: 'Terapia' },
		{ path: '/workouts/jogos', text: 'Jogos' },
		{ path: '/workouts/cursos', text: 'Cursos' },
		{ path: '/workouts/tutorial', text: 'Tutorial' },
		{ path: '/workouts/comentario', text: 'Comentario' }]
		}		
      ]
    },
    { 
      path: '/shop', 
      icon: <ShoppingCart />, 
      text: 'Shop', 
      subItems: [
        { path: '/shop/products', text: 'Products' },
        { path: '/shop/orders', text: 'Orders' },
        { path: '/shop/categories', text: 'Categories' }
      ]
    },
    { path: '/audio', icon: <Headphones />, text: 'Audio' },
    { path: '/blog', icon: <Book />, text: 'Blog' },
    { path: '/requests', icon: <Assignment />, text: 'Requests' },
    { path: '/billing', icon: <AttachMoney />, text: 'Billing' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const toggleSubMenu = (index) => {
    if (index === 2) { // Assuming 'Workouts' is the 3rd item in the menu
      setWorkoutsOpen(!workoutsOpen);
    } else if (index === 3) { // Assuming 'Shop' is the 4th item in the menu
      setMaterialOpen(!materialOpen);
    } else if (index === 4) { // Assuming 'Shop' is the 5th item in the menu
      setShopOpen(!shopOpen);
    } else {
      handleNavigation(menuItems[index].path);
    }
  };

  return (
    <aside className="w-64 bg-gray-800 text-white">
      <div className="p-4">
        <img src="/logo.svg" alt="Tagarella" className="h-8" />
      </div>
      <nav className="mt-8">
        {menuItems.map((item, index) => (
          <div key={item.path}>
            <div
              onClick={() => toggleSubMenu(index)}
              className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors cursor-pointer ${
                location.pathname === item.path ? 'bg-gray-700 text-white' : ''
              }`}
            >
              <span className="mr-4">{item.icon}</span>
              <span>{item.text}</span>
              {item.subItems && (
                (index === 2 && workoutsOpen) || (index === 3 && materialOpen) || (index === 4 && shopOpen) 
                  ? <ExpandMore className="ml-auto" /> 
                  : <ChevronRight className="ml-auto" />
              )}
            </div>
            {item.subItems && (
              <div className={`ml-8 ${((index === 2 && workoutsOpen) || (index === 3 && materialOpen) || (index === 4 && shopOpen)) ? '' : 'hidden'}`}>
                {item.subItems.map((subItem) => (
                  <div
                    key={subItem.path}
                    onClick={() => handleNavigation(subItem.path)}
                    className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors cursor-pointer ${
                      location.pathname === subItem.path ? 'bg-gray-700 text-white' : ''
                    }`}
                  >
                    <span>{subItem.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
