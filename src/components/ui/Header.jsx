import React from 'react';
import LoginButton from '../auth/LoginButton';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onToggleBiblioteca }) => {
  const { currentUser } = useAuth();

  return (
    <header className="bg-gradient-to-r from-purple-700 to-purple-500 shadow-lg p-4 text-white">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
        {/* Left & Center */}
        <div className="text-center sm:text-left mb-4 sm:mb-0">
          <h1 className="text-xl md:text-2xl font-bold">El Predicador Católico</h1>
          <div className="text-xs md:text-sm opacity-80">
            {/* Hoy: [Fecha litúrgica actual] */}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {currentUser && (
            <button
              onClick={onToggleBiblioteca}
              className="px-3 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm bg-white text-purple-700 rounded-md hover:bg-gray-200 transition-colors font-semibold"
            >
              Mi Biblioteca
            </button>
          )}
          <LoginButton />
        </div>
      </div>
    </header>
  );
};

export default Header;