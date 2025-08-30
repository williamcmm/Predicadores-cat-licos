// Hook para sincronización automática de biblioteca
import { useState, useEffect } from 'react';

export const useSyncedLibrary = (currentUser) => {
  const [sermones, setSermones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    let syncInterval;
    
    const syncLibrary = async () => {
      if (!currentUser) {
        setSermones([]);
        setLoading(false);
        return;
      }

      try {
        const { default: storageService } = await import('../services/storage/storageService');
        const userSermons = await storageService.getCachedSermons(currentUser.uid);
        setSermones(userSermons);
        setLastSync(new Date());
      } catch (error) {
        console.error('Error sincronizando biblioteca:', error);
      }
      setLoading(false);
    };

    // Sincronización inicial
    syncLibrary();

    // Sincronización cada 2 minutos si está activo
    if (currentUser) {
      syncInterval = setInterval(syncLibrary, 2 * 60 * 1000);
    }

    return () => {
      if (syncInterval) clearInterval(syncInterval);
    };
  }, [currentUser]);

  const forceSync = async () => {
    setLoading(true);
    // Limpiar cache para forzar recarga
    localStorage.removeItem('sermonesCache');
    localStorage.removeItem('cacheTimestamp');
    
    if (currentUser) {
      const { default: storageService } = await import('../services/storage/storageService');
      const userSermons = await storageService.getCachedSermons(currentUser.uid);
      setSermones(userSermons);
      setLastSync(new Date());
    }
    setLoading(false);
  };

  return { sermones, loading, lastSync, forceSync };
};
