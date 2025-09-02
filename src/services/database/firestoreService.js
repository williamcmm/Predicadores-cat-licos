// Servicio mejorado para guardar y recuperar sermones con cache
import { getFirestore, collection, addDoc, getDocs, query, where, doc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';

const db = getFirestore();
let sermonesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export async function guardarSermon(sermon) {
  try {
    console.log('💾 Guardando sermón en Firestore...', {
      hasId: !!sermon.id,
      title: sermon.title,
      userId: sermon.userId,
      isPublicCopy: !!sermon.basadoEnSermonPublico
    });
    
    // Validar que el sermón tenga los campos mínimos requeridos
    if (!sermon.title || !sermon.userId) {
      throw new Error('El sermón debe tener título y userId');
    }
    
    // Asegurar que el sermón tenga la estructura correcta
    const sermonToSave = {
      ...sermon,
      introduction: sermon.introduction || { presentation: '', motivation: '' },
      ideas: sermon.ideas || [],
      imperatives: sermon.imperatives || '',
      type: sermon.type || 'Homilía'
    };
    
    // Eliminar campos undefined que Firestore no acepta
    const cleanSermon = Object.fromEntries(
      Object.entries(sermonToSave).filter(([_, value]) => value !== undefined)
    );
    
    // Si es una copia de un sermón público o no tiene ID, crear nuevo documento
    if (sermon.basadoEnSermonPublico || !sermon.id) {
      // Crear una copia limpia sin el ID original y sin campos undefined
      const { id, ...sermonLimpio } = cleanSermon;
      console.log('🆕 Creando nuevo documento para sermón:', sermonLimpio.title);
      const docRef = await addDoc(collection(db, 'sermones'), sermonLimpio);
      console.log('✅ Nuevo sermón guardado con ID:', docRef.id);
      
      // Invalidar cache después de guardar
      sermonesCache = null;
      cacheTimestamp = null;
      
      return docRef.id;
    } else {
      // Actualizar sermón existente
      console.log('🔄 Actualizando sermón existente:', sermon.id);
      const sermonRef = doc(db, 'sermones', sermon.id);
      const { id, ...sermonData } = cleanSermon;
      await setDoc(sermonRef, sermonData);
      console.log('✅ Sermón actualizado con ID:', sermon.id);
      
      // Invalidar cache después de guardar
      sermonesCache = null;
      cacheTimestamp = null;
      
      return sermon.id;
    }
  } catch (error) {
    console.error('❌ Error al guardar sermón:', error);
    console.error('❌ Detalles del error:', {
      message: error.message,
      code: error.code,
      sermon: { title: sermon?.title, userId: sermon?.userId, hasId: !!sermon?.id }
    });
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

// =============================
// FUNCIONES DE SERMONES PÚBLICOS
// =============================

// Publicar un sermón (solo para super admin)
export async function publicarSermon(sermon) {
  try {
    console.log('🚀 Firestoreservice: Iniciando publicación de sermón:', {
      id: sermon.id, 
      title: sermon.title, 
      userId: sermon.userId
    });
    
    const sermonPublico = {
      ...sermon,
      esPublico: true,
      fechaPublicacion: new Date(),
      autorOriginal: sermon.userId,
      sermonOriginalId: sermon.id // Guardamos el ID del sermón original para poder referenciar
    };
    
    console.log('📄 Firestoreservice: Datos del sermón público preparados:', {
      title: sermonPublico.title,
      esPublico: sermonPublico.esPublico,
      fechaPublicacion: sermonPublico.fechaPublicacion,
      autorOriginal: sermonPublico.autorOriginal,
      sermonOriginalId: sermonPublico.sermonOriginalId
    });
    
    console.log('💾 Firestoreservice: Guardando en colección sermonesPublicos...');
    const docRef = await addDoc(collection(db, 'sermonesPublicos'), sermonPublico);
    console.log('✅ Firestoreservice: Sermón publicado exitosamente con ID:', docRef.id);
    console.log('🎯 Firestoreservice: Sermón ahora disponible en la colección sermonesPublicos');
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Firestoreservice: Error al publicar sermón:', error);
    throw error;
  }
}

// Obtener todos los sermones públicos
export async function obtenerSermonesPublicos() {
  try {
    console.log('🔍 Firestoreservice: Iniciando consulta de sermones públicos...');
    
    // Primero intentar la consulta simple sin ordenar
    const q = query(
      collection(db, "sermonesPublicos"), 
      where("esPublico", "==", true)
    );
    
    console.log('📋 Firestoreservice: Query configurada (sin orderBy), ejecutando...');
    const querySnapshot = await getDocs(q);
    console.log('📊 Firestoreservice: Query ejecutada, documentos encontrados:', querySnapshot.size);
    
    const sermones = querySnapshot.docs.map(doc => {
      const data = { id: doc.id, ...doc.data() };
      console.log('📄 Firestoreservice: Documento procesado:', { 
        id: data.id, 
        title: data.title, 
        autor: data.autor, 
        fechaPublicacion: data.fechaPublicacion 
      });
      return data;
    });
    
    // Ordenar en el cliente por fecha de publicación (más reciente primero)
    const sermonesOrdenados = sermones.sort((a, b) => {
      const fechaA = a.fechaPublicacion?.toDate?.() || a.fechaPublicacion || new Date(0);
      const fechaB = b.fechaPublicacion?.toDate?.() || b.fechaPublicacion || new Date(0);
      return fechaB - fechaA;
    });
    
    console.log('✅ Firestoreservice: Sermones públicos obtenidos y ordenados exitosamente:', sermonesOrdenados.length, 'sermones');
    return sermonesOrdenados;
  } catch (error) {
    console.error('❌ Firestoreservice: Error al obtener sermones públicos:', error);
    throw error;
  }
}

// Despublicar un sermón (solo para super admin)
export async function despublicarSermon(sermonPublicoId) {
  try {
    console.log('Despublicando sermón:', sermonPublicoId);
    const sermonRef = doc(db, 'sermonesPublicos', sermonPublicoId);
    await deleteDoc(sermonRef);
    console.log('Sermón despublicado exitosamente');
  } catch (error) {
    console.error('Error al despublicar sermón:', error);
    throw error;
  }
}

// Verificar si un sermón ya está publicado
export async function verificarSermonPublicado(sermonOriginalId) {
  try {
    const q = query(
      collection(db, "sermonesPublicos"), 
      where("sermonOriginalId", "==", sermonOriginalId),
      where("esPublico", "==", true)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error al verificar sermón publicado:', error);
    return false;
  }
}

// Encontrar sermón público por ID original
export async function encontrarSermonPublicoPorOriginal(sermonOriginalId) {
  try {
    const q = query(
      collection(db, "sermonesPublicos"), 
      where("sermonOriginalId", "==", sermonOriginalId),
      where("esPublico", "==", true)
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id; // Retorna el ID del documento público
    }
    return null;
  } catch (error) {
    console.error('Error al encontrar sermón público:', error);
    return null;
  }
}

// Obtener un sermón público específico por ID
export async function obtenerSermonPublico(sermonPublicoId) {
  try {
    console.log('Obteniendo sermón público:', sermonPublicoId);
    const sermonRef = doc(db, 'sermonesPublicos', sermonPublicoId);
    const sermonDoc = await getDoc(sermonRef);
    
    if (sermonDoc.exists()) {
      return { id: sermonDoc.id, ...sermonDoc.data() };
    } else {
      console.log('Sermón público no encontrado');
      return null;
    }
  } catch (error) {
    console.error('Error al obtener sermón público:', error);
    throw error;
  }
}

