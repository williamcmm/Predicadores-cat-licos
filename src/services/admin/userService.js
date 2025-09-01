import { getFirestore, collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import app from '../../config/firebase';

const db = getFirestore(app);

// Obtener todos los usuarios para el panel de administración
export const obtenerTodosLosUsuarios = async () => {
  try {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const usuarios = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return usuarios;
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    throw error;
  }
};

// Actualizar nivel de usuario
export const actualizarNivelUsuario = async (userId, nuevoNivel) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      userLevel: nuevoNivel,
      updatedAt: new Date()
    });
    console.log(`Nivel actualizado para usuario ${userId}: ${nuevoNivel}`);
    return true;
  } catch (error) {
    console.error('Error actualizando nivel de usuario:', error);
    throw error;
  }
};

// Obtener estadísticas de usuarios por nivel
export const obtenerEstadisticasUsuarios = async () => {
  try {
    const usuarios = await obtenerTodosLosUsuarios();
    const estadisticas = {
      total: usuarios.length,
      básico: usuarios.filter(u => u.userLevel === 'básico').length,
      intermedio: usuarios.filter(u => u.userLevel === 'intermedio').length,
      avanzado: usuarios.filter(u => u.userLevel === 'avanzado').length,
      administrador: usuarios.filter(u => u.userLevel === 'administrador').length
    };
    return estadisticas;
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    throw error;
  }
};

// Verificar si un usuario tiene permisos de administrador
export const esAdministrador = (usuario) => {
  return usuario && usuario.userLevel === 'administrador';
};

// Verificar nivel mínimo requerido
export const tieneNivelMinimo = (usuario, nivelRequerido) => {
  if (!usuario) return false;
  
  const jerarquia = {
    'básico': 1,
    'intermedio': 2,
    'avanzado': 3,
    'administrador': 4
  };
  
  const nivelUsuario = jerarquia[usuario.userLevel] || 0;
  const nivelMinimo = jerarquia[nivelRequerido] || 0;
  
  return nivelUsuario >= nivelMinimo;
};

export default {
  obtenerTodosLosUsuarios,
  actualizarNivelUsuario,
  obtenerEstadisticasUsuarios,
  esAdministrador,
  tieneNivelMinimo
};
