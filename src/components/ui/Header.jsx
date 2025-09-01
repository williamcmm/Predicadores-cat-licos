import React from 'react';
import LoginButton from '../auth/LoginButton';
import ShareButton from './ShareButton';
import UserMenu from './UserMenu';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onToggleBiblioteca, onOpenAdminPanel }) => {
  const { currentUser } = useAuth();
  // Anti-cache timestamp
  const buildVersion = "2025-09-01-v2";

  return (
    <header className="bg-gradient-to-r from-purple-700 to-purple-500 shadow-lg p-4 text-white">
      <div className="container mx-auto">
        {/* Mobile Layout - SINGLE ROW */}
        <div className="flex justify-between items-center md:hidden">
          {/* Left - App Name */}
          <div className="flex-shrink-0">
            <h1 className="text-lg font-bold">
              Predicador Católico
            </h1>
          </div>
          
          {/* Right - Share + Biblioteca + Menu/Login */}
          <div className="flex items-center gap-2">
            <ShareButton />
            <button
              onClick={onToggleBiblioteca}
              className="px-2 py-1 text-xs bg-white text-purple-700 rounded-md hover:bg-gray-200 transition-colors font-semibold"
            >
              Biblioteca
            </button>
            
            {currentUser ? (
              <UserMenu onOpenAdminPanel={onOpenAdminPanel} />
            ) : (
              <LoginButton />
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex justify-between items-center">
          {/* Left - App Name */}
          <div className="flex-shrink-0">
            <h1 className="text-xl lg:text-2xl font-bold">
              Predicador Católico
            </h1>
          </div>

          {/* Center - Share Button */}
          <div className="flex-1 flex justify-center">
            <ShareButton />
          </div>

          {/* Right - Biblioteca + Menu/Login */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={onToggleBiblioteca}
              className="px-4 py-2 bg-white text-purple-700 rounded-md hover:bg-gray-200 transition-colors font-semibold"
            >
              Biblioteca
            </button>
            
            {currentUser ? (
              <UserMenu onOpenAdminPanel={onOpenAdminPanel} />
            ) : (
              <LoginButton />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;