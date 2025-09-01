import React, { useState } from 'react';
import LoginButton from '../auth/LoginButton';
import { useAuth } from '../../context/AuthContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';

const Header = ({ onToggleBiblioteca, onToggleAdminPanel, membershipLevel, userRole }) => {
  const { currentUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const { canInstall, installApp } = usePWAInstall();

  const hasAccess = !!membershipLevel || userRole === 'super_admin';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleShareMenu = () => {
    setShowShareMenu(!showShareMenu);
  };

  const shareUrl = 'https://predicadores-catolicos.web.app';
  const shareText = 'Predicador - Herramienta IA para crear sermones católicos';

  const shareOptions = [
    {
      name: 'WhatsApp',
      url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Twitter',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Email',
      url: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareText + '\\n\\n' + shareUrl)}`
    },
    {
      name: 'Copiar enlace',
      action: () => {
        navigator.clipboard.writeText(shareUrl);
        alert('¡Enlace copiado!');
        setShowShareMenu(false);
      }
    }
  ];

  const handleShare = (option) => {
    if (option.action) {
      option.action();
    } else {
      window.open(option.url, '_blank', 'noopener,noreferrer');
    }
    setShowShareMenu(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm relative z-30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Título simple */}
          <div>
            <h1 className="text-xl font-bold text-gray-800">Predicador</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Biblioteca Button */}
            {hasAccess && (
              <button
                onClick={onToggleBiblioteca}
                className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 transition-colors font-semibold"
              >
                Biblioteca
              </button>
            )}

            {/* Share Button */}
            <div className="relative">
              <button
                onClick={toggleShareMenu}
                className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 transition-colors font-semibold"
              >
                Compartir
              </button>

              {/* Share dropdown */}
              {showShareMenu && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-48 z-50">
                  {shareOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleShare(option)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Panel Button */}
            {userRole === 'super_admin' && (
              <button
                onClick={onToggleAdminPanel}
                className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 transition-colors font-semibold"
              >
                Admin
              </button>
            )}

            {/* Login Button */}
            <LoginButton />
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden flex items-center space-x-3">
            {/* Biblioteca Button - Mobile */}
            {hasAccess && (
              <button
                onClick={onToggleBiblioteca}
                className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 transition-colors font-semibold"
              >
                Biblioteca
              </button>
            )}

            {/* Share Button - Mobile */}
            <div className="relative">
              <button
                onClick={toggleShareMenu}
                className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 transition-colors font-semibold"
              >
                Compartir
              </button>

              {/* Share dropdown mobile */}
              {showShareMenu && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-48 z-50">
                  {shareOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleShare(option)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile hamburger menu button */}
            <button
              onClick={toggleMenu}
              className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 transition-colors font-semibold"
            >
              Menú
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="p-4 space-y-3">
              {/* Admin panel - solo para super admin */}
              {userRole === 'super_admin' && (
                <button
                  onClick={() => {
                    onToggleAdminPanel();
                    closeMenu();
                  }}
                  className="w-full px-4 py-3 text-left bg-slate-700 text-white rounded-md hover:bg-slate-800 transition-colors font-semibold"
                >
                  Admin
                </button>
              )}
              
              {/* PWA Install options */}
              {canInstall && (
                <button
                  onClick={() => {
                    installApp();
                    closeMenu();
                  }}
                  className="w-full px-4 py-3 text-left bg-slate-700 text-white rounded-md hover:bg-slate-800 transition-colors font-semibold"
                >
                  Instalar
                </button>
              )}
              
              <div className="border-t border-gray-200 pt-3">
                <LoginButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
