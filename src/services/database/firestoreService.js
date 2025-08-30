// Servicio mejorado para guardar y recuperar sermones con cache
import app from '../../config/firebase';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';

const db = getFirestore();
let sermonesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export async function guardarSermon(sermon) {
  try {
    console.log('Guardando sermón en Firestore...');
    const docRef = await addDoc(collection(db, 'sermones'), sermon);
    
    // Invalidar cache después de guardar
    sermonesCache = null;
    cacheTimestamp = null;
    
    console.log('Sermón guardado exitosamente con ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error al guardar sermón:', error);
    throw error;
  }
}

export async function obtenerSermones(userId) {
  try {
    if (!userId) {
      return [];
    }

    // Verificar si tenemos cache válido
    const now = Date.now();
    if (sermonesCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('Usando sermones desde cache');
      return sermonesCache.filter(sermon => sermon.userId === userId);
    }

    console.log('Descargando sermones desde Firestore...');
    const q = query(collection(db, "sermones"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const sermones = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Actualizar cache
    sermonesCache = sermones;
    cacheTimestamp = now;
    
    console.log('Descargados sermones:', sermones.length);
    return sermones;
  } catch (error) {
    console.error('Error al obtener sermones:', error);
    throw error;
  }
}

export async function eliminarSermon(sermonId) {
  try {
    console.log('Eliminando sermón:', sermonId);
    const sermonRef = doc(db, 'sermones', sermonId);
    await deleteDoc(sermonRef);
    
    // Invalidar cache después de eliminar
    sermonesCache = null;
    cacheTimestamp = null;
    
    console.log('Sermón eliminado exitosamente');
  } catch (error) {
    console.error('Error al eliminar sermón:', error);
    throw error;
  }
}

// Función para limpiar cache manualmente
export function limpiarCache() {
  sermonesCache = null;
  cacheTimestamp = null;
  console.log('Cache de sermones limpiado');
}

