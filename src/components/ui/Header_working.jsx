import React, { useState } from 'react';
import LoginButton from '../auth/LoginButton';
import { useAuth } from '../../context/AuthContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';

const Header = ({ onToggleBiblioteca, onToggleAdminPanel, membershipLevel, userRole }) => {
  const { currentUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
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
      icon: '💬',
      url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
    },
    {
      name: 'Facebook',
      icon: '📘',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Twitter',
      icon: '🐦',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Email',
      icon: '📧',
      url: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareText + '\\n\\n' + shareUrl)}`
    },
    {
      name: 'Copiar Enlace',
      icon: '🔗',
      action: () => {
        navigator.clipboard.writeText(shareUrl);
        alert('¡Enlace copiado al portapapeles!');
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
    <header className="bg-gradient-to-r from-purple-700 to-purple-500 shadow-lg text-white relative">
      {/* Header principal */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Título */}
          <div className="text-left">
            <h1 className="text-base sm:text-xl md:text-2xl font-bold text-white">Predicador</h1>
          </div>
            
          {/* Botón compartir */}
          <div className="relative">
            <button
              onClick={toggleShareMenu}
              className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-semibold"
            >
              Compartir
            </button>

            {/* Menú de compartir */}
            {showShareMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowShareMenu(false)}
                ></div>
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                  <div className="p-2">
                    <div className="text-sm font-semibold text-gray-700 px-3 py-2 border-b">
                      Compartir página
                    </div>
                    {shareOptions.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleShare(option)}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <span>{option.icon}</span>
                        <span>{option.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Desktop: Botones completos */}
          <div className="hidden lg:flex items-center space-x-3">
            {currentUser && (
              <>
                <button
                  onClick={onToggleBiblioteca}
                  disabled={!hasAccess}
                  className={`px-4 py-2 text-sm bg-slate-700 text-white rounded-md hover:bg-slate-800 transition-colors font-semibold ${
                    !hasAccess && 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  Biblioteca
                </button>
                {userRole === 'super_admin' && (
                  <button
                    onClick={onToggleAdminPanel}
                    className="px-4 py-2 text-sm bg-slate-700 text-white rounded-md hover:bg-slate-800 transition-colors font-semibold"
                  >
                    Admin
                  </button>
                )}
              </>
            )}
            <LoginButton />
          </div>

          {/* Mobile: Biblioteca + Menu */}
          <div className="lg:hidden flex items-center space-x-2">
            {!currentUser ? (
              <LoginButton />
            ) : (
              hasAccess && (
                <button
                  onClick={onToggleBiblioteca}
                  className="px-3 py-2 text-sm bg-slate-700 text-white rounded-md hover:bg-slate-800 transition-colors font-semibold flex items-center space-x-2"
                >
                  <span>📚</span>
                  <span>Biblioteca</span>
                </button>
              )
            )}
            
            {/* Menu button */}
            <button
              onClick={toggleMenu}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-md transition-colors relative"
              aria-label="Menú"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
              {(currentUser && userRole === 'super_admin') && !isMenuOpen && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"></div>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 bg-white rounded-lg shadow-lg border overflow-hidden">
            <div className="p-4 space-y-3">
              {currentUser ? (
                <div className="space-y-3">
                  {userRole === 'super_admin' && (
                    <button
                      onClick={() => {
                        onToggleAdminPanel();
                        closeMenu();
                      }}
                      className="w-full px-4 py-3 text-left bg-slate-700 text-white rounded-md hover:bg-slate-800 transition-colors font-semibold"
                    >
                      Panel Admin
                    </button>
                  )}
                  
                  {canInstall && (
                    <button
                      onClick={() => {
                        installApp();
                        closeMenu();
                      }}
                      className="w-full px-4 py-3 text-left bg-slate-700 text-white rounded-md hover:bg-slate-800 transition-colors font-semibold"
                    >
                      Instalar App
                    </button>
                  )}
                  
                  <div className="border-t border-gray-200 pt-3">
                    <LoginButton />
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-600">
                  <p className="text-sm">Inicia sesión para acceder a más opciones</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PWA Installation Guide Modal */}
        {showInstallGuide && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">📱 Instalar Aplicación</h3>
                <button
                  onClick={() => setShowInstallGuide(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="text-sm text-gray-600 space-y-3">
                <div>
                  <p className="font-semibold">📱 En iPhone/iPad:</p>
                  <p>1. Toca el botón "Compartir" (□↑)</p>
                  <p>2. Selecciona "Agregar a pantalla de inicio"</p>
                </div>
                <div>
                  <p className="font-semibold">🤖 En Android:</p>
                  <p>1. Toca los 3 puntos (⋮) del navegador</p>
                  <p>2. Selecciona "Agregar a pantalla de inicio"</p>
                </div>
              </div>
              <button
                onClick={() => setShowInstallGuide(false)}
                className="w-full py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
