import React from 'react';
import LoginButton from '../auth/LoginButton';
import ShareButton from './ShareButton';
import UserMenu from './UserMenu';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onToggleBiblioteca, onOpenAdminPanel }) => {
  const { currentUser } = useAuth();

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
          
          {/* Right - Conditional based on user state */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              // LOGGED IN: Show Share + Biblioteca + UserMenu
              <>
                <ShareButton />
                <button
                  onClick={onToggleBiblioteca}
                  className="px-2 py-1 text-xs bg-white text-purple-700 rounded-md hover:bg-gray-200 transition-colors font-semibold"
                >
                  Biblioteca
                </button>
                <UserMenu onOpenAdminPanel={onOpenAdminPanel} />
              </>
            ) : (
              // NOT LOGGED IN: Show only Login button
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

          {currentUser ? (
            // LOGGED IN: Show Share (center) + Biblioteca + UserMenu (right)
            <>
              {/* Center - Share Button */}
              <div className="flex-1 flex justify-center">
                <ShareButton />
              </div>

              {/* Right - Biblioteca + UserMenu */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={onToggleBiblioteca}
                  className="px-4 py-2 bg-white text-purple-700 rounded-md hover:bg-gray-200 transition-colors font-semibold"
                >
                  Biblioteca
                </button>
                <UserMenu onOpenAdminPanel={onOpenAdminPanel} />
              </div>
            </>
          ) : (
            // NOT LOGGED IN: Show only Login button (right)
            <>
              {/* Empty center space */}
              <div className="flex-1"></div>
              
              {/* Right - Login button */}
              <div className="flex items-center flex-shrink-0">
                <LoginButton />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;