import React from 'react';
import { signInWithGoogle, signOutUser } from '../../services/auth/authService';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import app from '../../config/firebase';

const auth = getAuth(app);

const LoginButton = () => {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

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
    <div className="flex items-center space-x-4">
      {user ? (
        <>
          <span className="text-white text-sm">Hola, {user.displayName}</span>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Cerrar Sesión
          </button>
        </>
      ) : (
        <button
          onClick={handleSignIn}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Iniciar Sesión con Google
        </button>
      )}
    </div>
  );
};

export default LoginButton;
