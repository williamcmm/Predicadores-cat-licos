import React from 'react';
import LoginButton from '../auth/LoginButton';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onToggleBiblioteca }) => {
  const { currentUser } = useAuth();

  return (
    <header className="h-16 bg-gradient-to-r from-purple-700 to-purple-500 flex items-center justify-between px-6 shadow-lg">
      {/* Left side: Liturgical info (future) */}
      <div className="text-white text-sm opacity-80">
        {/* Hoy: [Fecha litúrgica actual] */}
      </div>

      {/* Center: Title */}
      <h1 className="text-white text-2xl font-bold">El Predicador Católico</h1>

      {/* Right side: Login Button, Mi Biblioteca, Fullscreen (future) */}
      <div className="flex items-center space-x-4">
        {currentUser && (
          <button
            onClick={onToggleBiblioteca}
            className="px-4 py-2 bg-white text-purple-700 rounded-md hover:bg-gray-200 transition-colors font-semibold"
          >
            Mi Biblioteca
          </button>
        )}
        <LoginButton />
      </div>
    </header>
  );
};

export default Header;
