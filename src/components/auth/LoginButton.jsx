import React from 'react';
import { signInWithGoogle, signOutUser } from '../../services/auth/authService';
import { useAuth } from '../../context/AuthContext';

const LoginButton = () => {
  const { currentUser, loading } = useAuth();

  const handleSignIn = async () => {
    try {
      console.log('Iniciando proceso de login...');
      await signInWithGoogle();
      console.log('Login exitoso');
    } catch (error) {
      console.error('Error durante el login:', error);
      
      // Mostrar mensaje de error específico al usuario
      let errorMessage = 'Error durante el inicio de sesión';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'El popup fue cerrado antes de completar el login';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'El popup fue bloqueado por el navegador';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'Dominio no autorizado para el login';
      }
      
      alert(errorMessage);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Error al cerrar sesión');
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-2 bg-gray-500 text-white rounded-md">
        Cargando...
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {currentUser ? (
        <>
          <span className="text-white text-sm hidden sm:inline">
            Hola, {currentUser.displayName || 'Usuario'}
          </span>
          <button
            onClick={handleSignOut}
            className="px-3 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Cerrar Sesión
          </button>
        </>
      ) : (
        <button
          onClick={handleSignIn}
          className="px-3 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Iniciar Sesión</span>
        </button>
      )}
    </div>
  );
};

export default LoginButton;
