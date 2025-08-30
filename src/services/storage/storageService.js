// Servicio híbrido optimizado para guardado rápido y persistencia
import { guardarSermon as guardarEnFirestore, obtenerSermones } from '../database/firestoreService';

class StorageService {
  constructor() {
    this.CURRENT_SERMON_KEY = 'currentSermon';
    this.SERMONES_CACHE_KEY = 'sermonesCache';
    this.CACHE_TIMESTAMP_KEY = 'cacheTimestamp';
    this.CACHE_DURATION = 30 * 60 * 1000; // 30 minutos
  }

  // GUARDADO HÍBRIDO: Inmediato local + Async Firestore
  async saveSermonHybrid(sermon, userId) {
    try {
      // 1. Guardar inmediatamente en localStorage (feedback inmediato)
      this.saveToLocalStorage(sermon);
      
      // 2. Guardar en Firestore (persistencia)
      const docId = await guardarEnFirestore({ ...sermon, userId, createdAt: new Date() });
      
      // 3. Actualizar cache de biblioteca
      this.updateSermonInCache(sermon, docId, userId);
      
      console.log('Sermón guardado híbrido exitoso:', docId);
      return { success: true, docId, message: 'Guardado exitosamente' };
      
    } catch (error) {
      console.error('Error en guardado híbrido:', error);
      return { success: false, error: error.message };
    }
  }

  // CARGA INTELIGENTE: Firestore  localStorage si autenticado
  async loadInitialSermon(userId) {
    if (!userId) {
      // Sin usuario: limpiar y retornar estado inicial
      localStorage.removeItem(this.CURRENT_SERMON_KEY);
      return this.getInitialSermonState();
    }

    try {
      // 1. Verificar si hay sermón local reciente
      const localSermon = this.getFromLocalStorage();
      
      // 2. Si hay local y es del mismo usuario, usar ese
      if (localSermon && localSermon.userId === userId) {
        return localSermon;
      }
      
      // 3. Cargar último sermón del usuario desde Firestore
      const sermones = await obtenerSermones(userId);
      if (sermones && sermones.length > 0) {
        const ultimoSermon = sermones[0]; // Asumiendo orden descendente
        this.saveToLocalStorage(ultimoSermon);
        return ultimoSermon;
      }
      
      // 4. Nuevo usuario: estado inicial
      return this.getInitialSermonState();
      
    } catch (error) {
      console.error('Error cargando sermón inicial:', error);
      return this.getFromLocalStorage() || this.getInitialSermonState();
    }
  }

  // CACHE DE BIBLIOTECA OPTIMIZADO
  async getCachedSermons(userId) {
    if (!userId) return [];
    
    try {
      // Verificar cache válido
      const cached = localStorage.getItem(this.SERMONES_CACHE_KEY);
      const timestamp = localStorage.getItem(this.CACHE_TIMESTAMP_KEY);
      
      if (cached && timestamp && (Date.now() - parseInt(timestamp)) < this.CACHE_DURATION) {
        const parsedCache = JSON.parse(cached);
        return parsedCache.filter(s => s.userId === userId);
      }
      
      // Cache expirado: recargar desde Firestore
      const sermones = await obtenerSermones(userId);
      this.setCachedSermons(sermones);
      return sermones;
      
    } catch (error) {
      console.error('Error obteniendo sermones:', error);
      return [];
    }
  }

  // Utilidades privadas
  saveToLocalStorage(sermon) {
    localStorage.setItem(this.CURRENT_SERMON_KEY, JSON.stringify(sermon));
  }

  getFromLocalStorage() {
    try {
      const saved = localStorage.getItem(this.CURRENT_SERMON_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error parseando localStorage:', error);
      return null;
    }
  }

  setCachedSermons(sermones) {
    localStorage.setItem(this.SERMONES_CACHE_KEY, JSON.stringify(sermones));
    localStorage.setItem(this.CACHE_TIMESTAMP_KEY, Date.now().toString());
  }

  updateSermonInCache(sermon, docId, userId) {
    try {
      const cached = localStorage.getItem(this.SERMONES_CACHE_KEY);
      if (cached) {
        let sermones = JSON.parse(cached);
        const sermonWithId = { ...sermon, id: docId, userId };
        
        // Buscar si ya existe y actualizar, o agregar al principio
        const existingIndex = sermones.findIndex(s => s.id === docId);
        if (existingIndex >= 0) {
          sermones[existingIndex] = sermonWithId;
        } else {
          sermones.unshift(sermonWithId);
        }
        
        this.setCachedSermons(sermones);
      }
    } catch (error) {
      console.error('Error actualizando cache:', error);
    }
  }

  getInitialSermonState() {
    return {
      title: '',
      introduction: { presentation: '', motivation: '' },
      ideas: [],
      imperatives: ''
    };
  }

  // Limpiar al cerrar sesión
  clearUserData() {
    localStorage.removeItem(this.CURRENT_SERMON_KEY);
    localStorage.removeItem(this.SERMONES_CACHE_KEY);
    localStorage.removeItem(this.CACHE_TIMESTAMP_KEY);
  }
}

const storageServiceInstance = new StorageService();
export default storageServiceInstance;


