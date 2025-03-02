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
  const [openMenus, setOpenMenus] = useState({});

  const menuItems = [
    { path: '/', icon: <Home />, text: 'Dashboard' },
    { 
	  path: '',
	  icon: <People />, 
	  text: 'Clientes',
	  subItems: [
        { path: '/clients', text: 'Clientes' },
        { path: '/terapeutas', text: 'Terapeutas' }
	  ]
	},
    { 
      path: '/workouts', 
      icon: <FitnessCenter />, 
      text: 'Treinamento', 
      subItems: [
        { path: '/workouts/sessoes', text: 'Sessões' },
        { path: '/workouts/pagamentos', text: 'Pagamentos' },
        { path: '/workouts/ocorrencias', text: 'Ocorrencias' },
        { 
          path: '/material', 
          text: 'Material',
          subItems: [
            { path: '/avaliacao', text: 'Avaliação' },
            { path: '/terapia', text: 'Terapia' },
            { path: '/jogos', text: 'Jogos' },
            { path: '/cursos', text: 'Cursos' },
            { path: '/tutorial', text: 'Tutorial' },
            { path: '/comentario', text: 'Comentario' }
          ]
        }		
      ]
    },
    { 
      path: '/shop', 
      icon: <ShoppingCart />, 
      text: 'Loja', 
      subItems: [
        { path: '/shop/products', text: 'Produtos' },
        { path: '/shop/orders', text: 'Pedidos' },
        { path: '/shop/categories', text: 'Categorias' }
      ]
    },
    { path: '/audio', icon: <Headphones />, text: 'Audio' },
    { path: '/blog', icon: <Book />, text: 'Blog' },
    { path: '/requests', icon: <Assignment />, text: 'Solicitações' },
    { path: '/billing', icon: <AttachMoney />, text: 'Cobrança' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const toggleSubMenu = (path) => {
    setOpenMenus((prevOpenMenus) => ({
      ...prevOpenMenus,
      [path]: !prevOpenMenus[path]
    }));
  };

  const renderMenuItems = (items, parentPath = '') => {
    return items.map((item) => {
      const fullPath = `${parentPath}${item.path}`;
      const isOpen = openMenus[fullPath];

      return (
        <div key={fullPath}>
          <div
            onClick={() => item.subItems ? toggleSubMenu(fullPath) : handleNavigation(fullPath)}
            className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors cursor-pointer ${
              location.pathname === fullPath ? 'bg-gray-700 text-white' : ''
            }`}
          >
            <span className="mr-4">{item.icon}</span>
            <span>{item.text}</span>
            {item.subItems && (
              isOpen ? <ExpandMore className="ml-auto" /> : <ChevronRight className="ml-auto" />
            )}
          </div>
          {item.subItems && isOpen && (
            <div className="ml-8">
              {renderMenuItems(item.subItems, `${fullPath}`)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <aside className="w-64 bg-gray-800 text-white">
      <div className="p-4" align="center">
        <img src="../../logo/logo.png" alt="Tagarella" className="h-8" />
      </div>
      <nav className="mt-8">
        {renderMenuItems(menuItems)}
      </nav>
    </aside>
  );
};

export default Sidebar;
