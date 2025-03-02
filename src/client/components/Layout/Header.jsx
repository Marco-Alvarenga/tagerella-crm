// src/client/components/Layout/Header.jsx
import React from 'react';
import { 
  Person, 
  Language, 
  KeyboardArrowDown 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [languageOpen, setLanguageOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const navigate = useNavigate();  

  return (
    <header className="bg-white shadow h-16 flex items-center justify-between px-6">
      <div className="text-xl font-semibold" onClick={() => navigate('/')} >Dashboard</div>
      
      <div className="flex items-center space-x-4">
        {/* Language Selector */}
        <div className="relative">
          <button
            className="flex items-center space-x-1 text-gray-700 hover:text-gray-900"
            onClick={() => setLanguageOpen(!languageOpen)}
          >
            <Language />
            <span>Portuguese</span>
            <KeyboardArrowDown />
          </button>
          
          {languageOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                English
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Portuguese
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Spanish
              </a>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative">
          <button
            className="flex items-center space-x-1 text-gray-700 hover:text-gray-900"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <Person />
            <span>User Teste</span>
            <KeyboardArrowDown />
          </button>
          
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Profile
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Settings
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Logout
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;