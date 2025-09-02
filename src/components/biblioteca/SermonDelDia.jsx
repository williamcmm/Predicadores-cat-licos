import React, { useState, useEffect } from 'react';
import { obtenerSermonesPublicos } from '../../services/database/firestoreService';

const SermonDelDia = ({ onOpenSermon, onClose }) => {
  const [sermonesPublicos, setSermonesPublicos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSermonesPublicos = async () => {
    setLoading(true);
    try {
      console.log('🔍 SermonDelDia: Iniciando carga de sermones públicos...');
      const sermones = await obtenerSermonesPublicos();
      console.log('📚 SermonDelDia: Sermones públicos obtenidos:', sermones.length, 'sermones');
      console.log('📝 SermonDelDia: Detalles de sermones:', sermones.map(s => ({ id: s.id, title: s.title, autor: s.autor })));
      
      setSermonesPublicos(sermones);
    } catch (error) {
      console.error("❌ SermonDelDia: Error fetching public sermons:", error);
    }
    setLoading(false);
    console.log('✅ SermonDelDia: Carga de sermones completada');
  };

  useEffect(() => {
    fetchSermonesPublicos();
  }, []);

  // Escuchar eventos de publicación/despublicación para actualizar automáticamente
  useEffect(() => {
    const handleSermonPublicado = (event) => {
      console.log('🎯 Evento de sermón publicado recibido en SermonDelDia:', event.detail);
      console.log('⏰ Timestamp del evento:', new Date(event.detail?.timestamp || Date.now()).toISOString());
      console.log('🔄 Actualizando lista de sermones públicos...');
      
      // Agregar un pequeño delay para asegurar que la base de datos esté actualizada
      setTimeout(() => {
        console.log('🔄 Ejecutando fetchSermonesPublicos después del delay...');
        fetchSermonesPublicos();
      }, event.detail?.isBackup ? 0 : 1000); // Sin delay para eventos de backup
    };

    console.log('👂 SermonDelDia: Registrando listeners para eventos sermonPublicado');
    window.addEventListener('sermonPublicado', handleSermonPublicado);
    
    return () => {
      console.log('🗑️ SermonDelDia: Removiendo listeners para eventos sermonPublicado');
      window.removeEventListener('sermonPublicado', handleSermonPublicado);
    };
  }, []);

  const handleOpenSermon = (sermon) => {
    onOpenSermon(sermon);
    onClose();
  };

  const testEventSystem = () => {
    console.log('🧪 Probando sistema de eventos...');
    window.dispatchEvent(new CustomEvent('sermonPublicado', { 
      detail: { sermonId: 'test', action: 'published', timestamp: Date.now(), isTest: true } 
    }));
    console.log('🧪 Evento de prueba disparado');
  };

  if (loading) {
    return (
      <div className="p-4 bg-white shadow-md rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Sermones Públicos</h2>
          <div className="flex gap-2">
            <button
              onClick={testEventSystem}
              className="px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
              title="Probar sistema de eventos"
            >
              🧪 Test
            </button>
            <button
              onClick={fetchSermonesPublicos}
              disabled={loading}
              className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title="Actualizar lista de sermones"
            >
              <span className={loading ? 'animate-spin' : ''}>🔄</span>
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>
        <p className="text-gray-600">Cargando sermones...</p>
      </div>
    );
  }

  if (sermonesPublicos.length === 0) {
    return (
      <div className="p-4 bg-white shadow-md rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Sermones Públicos</h2>
          <div className="flex gap-2">
            <button
              onClick={testEventSystem}
              className="px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
              title="Probar sistema de eventos"
            >
              🧪 Test
            </button>
            <button
              onClick={fetchSermonesPublicos}
              disabled={loading}
              className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title="Actualizar lista de sermones"
            >
              <span className={loading ? 'animate-spin' : ''}>🔄</span>
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            No hay sermones públicos disponibles en este momento.
          </p>
          <p className="text-sm text-gray-500">
            Los sermones aparecerán aquí cuando otros usuarios los publiquen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Sermones Públicos</h2>
        <div className="flex gap-2">
          <button
            onClick={testEventSystem}
            className="px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
            title="Probar sistema de eventos"
          >
            🧪 Test
          </button>
          <button
            onClick={fetchSermonesPublicos}
            disabled={loading}
            className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Actualizar lista de sermones"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {sermonesPublicos.map((sermon) => (
          <div key={sermon.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-800 mb-2">
                  {sermon.title || 'Sin título'}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Autor:</strong> {sermon.nombreAutor || sermon.autor || 'Autor desconocido'}</p>
                  <p><strong>Tipo:</strong> {sermon.type || 'No especificado'}</p>
                  <p><strong>Publicado:</strong> {sermon.fechaPublicacion?.seconds 
                    ? new Date(sermon.fechaPublicacion.seconds * 1000).toLocaleDateString()
                    : 'Fecha no disponible'
                  }</p>
                </div>
              </div>
              
              <div className="ml-4">
                <button
                  onClick={() => handleOpenSermon(sermon)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <span>📖</span> Abrir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SermonDelDia;
