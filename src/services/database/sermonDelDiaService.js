// Servicio para el Sermón del Día - Funcionalidad HOY
import { getFirestore, doc, setDoc, getDoc, onSnapshot, Timestamp } from 'firebase/firestore';

const db = getFirestore();
const SERMON_DEL_DIA_DOC = 'sermon-del-dia';

// Establecer el sermón del día (solo para admin/predicador)
export async function establecerSermonDelDia(sermon, predicadorInfo = {}) {
  try {
    const sermonDelDiaRef = doc(db, 'configuracion', SERMON_DEL_DIA_DOC);
    
    const sermonDelDia = {
      ...sermon,
      fechaActivacion: Timestamp.now(),
      predicador: {
        nombre: predicadorInfo.nombre || 'Predicador',
        email: predicadorInfo.email || '',
        ...predicadorInfo
      },
      activo: true,
      estadisticas: {
        vistas: 0,
        fechaCreacion: Timestamp.now()
      }
    };

    await setDoc(sermonDelDiaRef, sermonDelDia);
    
    return true;
  } catch (error) {
    console.error('Error estableciendo sermón del día:', error);
    throw error;
  }
}

// Obtener el sermón del día actual
export async function obtenerSermonDelDia() {
  try {
    const sermonDelDiaRef = doc(db, 'configuracion', SERMON_DEL_DIA_DOC);
    const docSnap = await getDoc(sermonDelDiaRef);
    
    if (docSnap.exists() && docSnap.data().activo) {
      const data = docSnap.data();
      
      // Incrementar contador de vistas
      await incrementarVistaSermonDelDia();
      
      return {
        ...data,
        id: SERMON_DEL_DIA_DOC
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error obteniendo sermón del día:', error);
    return null;
  }
}

// Escuchar cambios en tiempo real del sermón del día
export function escucharSermonDelDia(callback) {
  const sermonDelDiaRef = doc(db, 'configuracion', SERMON_DEL_DIA_DOC);
  
  return onSnapshot(sermonDelDiaRef, (doc) => {
    if (doc.exists() && doc.data().activo) {
      callback({
        ...doc.data(),
        id: SERMON_DEL_DIA_DOC
      });
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error escuchando sermón del día:', error);
    callback(null);
  });
}

// Desactivar el sermón del día
export async function desactivarSermonDelDia() {
  try {
    const sermonDelDiaRef = doc(db, 'configuracion', SERMON_DEL_DIA_DOC);
    await setDoc(sermonDelDiaRef, { activo: false }, { merge: true });
    ('Sermón del día desactivado');
    return true;
  } catch (error) {
    console.error('Error desactivando sermón del día:', error);
    throw error;
  }
}

// Incrementar contador de vistas (sin bloquear la UI)
async function incrementarVistaSermonDelDia() {
  try {
    const sermonDelDiaRef = doc(db, 'configuracion', SERMON_DEL_DIA_DOC);
    const docSnap = await getDoc(sermonDelDiaRef);
    
    if (docSnap.exists()) {
      const currentViews = docSnap.data().estadisticas?.vistas || 0;
      await setDoc(sermonDelDiaRef, {
        estadisticas: {
          ...docSnap.data().estadisticas,
          vistas: currentViews + 1,
          ultimaVista: Timestamp.now()
        }
      }, { merge: true });
    }
  } catch (error) {
    // No bloquear la UI si hay error en estadísticas
    console.warn('Error incrementando vistas:', error);
  }
}

// Obtener estadísticas del sermón del día
export async function obtenerEstadisticasSermonDelDia() {
  try {
    const sermonDelDiaRef = doc(db, 'configuracion', SERMON_DEL_DIA_DOC);
    const docSnap = await getDoc(sermonDelDiaRef);
    
    if (docSnap.exists()) {
      return docSnap.data().estadisticas || { vistas: 0 };
    }
    
    return { vistas: 0 };
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return { vistas: 0 };
  }
}
