// Hook personalizado para control de acceso basado en niveles
import { useAuth } from '../context/AuthContext';

export const useAccessControl = () => {
  const { currentUser, membershipLevel, userRole } = useAuth();

  // DEBUG: Mostrar información en consola
  console.log('=== DEBUG ACCESS CONTROL ===');
  console.log('currentUser:', currentUser?.email);
  console.log('membershipLevel:', membershipLevel);
  console.log('userRole:', userRole);
  console.log('============================');

  const hasAccess = {
    // Nivel 0: Solo crear sermones, no guardar
    createSermon: true,
    editSermon: true,
    
    // Nivel 1: Puede guardar sermones
    saveSermon: membershipLevel >= 1 || userRole === 'super_admin',
    personalLibrary: membershipLevel >= 1 || userRole === 'super_admin',
    
    // Nivel 2: Acceso a biblioteca compartida
    sharedLibrary: membershipLevel >= 2 || userRole === 'super_admin',
    sermonesCMM: membershipLevel >= 2 || userRole === 'super_admin',
    
    // Nivel 3: Chat y funciones premium
    chat: membershipLevel >= 3 || userRole === 'super_admin',
    premiumFeatures: membershipLevel >= 3 || userRole === 'super_admin',
    
    // Admin
    adminPanel: userRole === 'super_admin',
  };

  const getAccessMessage = (feature) => {
    const messages = {
      saveSermon: 'Necesitas ser Miembro Nivel 1 o superior para guardar sermones',
      personalLibrary: 'Necesitas ser Miembro Nivel 1 o superior para acceder a tu biblioteca',
      sharedLibrary: 'Necesitas ser Miembro Nivel 2 o superior para acceder a la biblioteca compartida',
      sermonesCMM: 'Necesitas ser Miembro Nivel 2 o superior para ver sermones CMM',
      chat: 'Necesitas ser Miembro Nivel 3 para usar el chat en vivo',
      premiumFeatures: 'Necesitas ser Miembro Nivel 3 para usar funciones premium',
    };
    return messages[feature] || 'No tienes permisos para esta acción';
  };

  return {
    currentUser,
    membershipLevel: membershipLevel || 0,
    userRole,
    hasAccess,
    getAccessMessage,
    isLoggedIn: !!currentUser,
  };
};

export default useAccessControl;
