import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { signInWithGoogle, signOutUser } from '../../services/auth/authService';

const LoginButton = () => {
  const { currentUser } = useAuth();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex items-center">
      {currentUser ? (
        <img
          src={currentUser.photoURL}
          alt="Perfil"
          onClick={handleSignOut}
          className="w-8 h-8 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
          title="Cerrar Sesión"
        />
      ) : (
        <button
          onClick={handleSignIn}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors font-semibold"
        >
          Login
        </button>
      )}
    </div>
  );
};

export default LoginButton;
