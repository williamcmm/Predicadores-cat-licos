import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import app from '../config/firebase';

const AuthContext = createContext();
const db = getFirestore(app);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  // Función para obtener/crear perfil de usuario con nivel
  const getUserProfile = async (user) => {
    if (!user) return null;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // Usuario existente - retornar perfil
        return userDoc.data();
      } else {
        // Nuevo usuario - crear perfil con nivel básico
        const newUserProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          userLevel: 'básico', // Nivel por defecto
          createdAt: new Date(),
          lastLogin: new Date()
        };

        await setDoc(userDocRef, newUserProfile);
        return newUserProfile;
      }
    } catch (error) {
      console.error('Error obteniendo perfil de usuario:', error);
      return null;
    }
  };

  // Función para actualizar último login
  const updateLastLogin = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, { lastLogin: new Date() }, { merge: true });
    } catch (error) {
      console.error('Error actualizando último login:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Usuario logueado - obtener perfil con nivel
        const profile = await getUserProfile(user);
        setCurrentUser({ ...user, userLevel: profile?.userLevel || 'básico' });
        setUserProfile(profile);
        
        // Actualizar último login
        await updateLastLogin(user.uid);
      } else {
        // Usuario deslogueado - limpiar estado
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  // Función para cerrar sesión
  const logout = async () => {
    console.log('AuthContext: Iniciando logout...');
    try {
      await signOut(auth);
      console.log('AuthContext: signOut exitoso');
      setCurrentUser(null);
      setUserProfile(null);
      console.log('AuthContext: Estado limpiado');
    } catch (error) {
      console.error('AuthContext: Error al cerrar sesión:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    logout,
    getUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
