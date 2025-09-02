import React, { useState, useEffect } from 'react';
import { obtenerSermonesPublicos } from '../../services/database/firestoreService';

const SermonDelDia = () => {
  const [sermonesPublicos, setSermonesPublicos] = useState([]);
  const [sermonSeleccionado, setSermonSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSermonesPublicos = async () => {
      try {
        const sermones = await obtenerSermonesPublicos();
        setSermonesPublicos(sermones);
        
        // Seleccionar el primer sermón por defecto si hay sermones disponibles
        if (sermones.length > 0) {
          setSermonSeleccionado(sermones[0]);
        }
      } catch (error) {
        console.error("Error fetching public sermons:", error);
      }
      setLoading(false);
    };

    fetchSermonesPublicos();
  }, []);

  const handleSermonClick = (sermon) => {
    setSermonSeleccionado(sermon);
  };

  if (loading) {
    return (
      <div className="p-4 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Sermones Públicos</h2>
        <p className="text-gray-600">Cargando sermones...</p>
      </div>
    );
  }

  if (sermonesPublicos.length === 0) {
    return (
      <div className="p-4 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Sermones Públicos</h2>
        <p className="text-gray-600">
          No hay sermones públicos disponibles en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white shadow-md rounded-lg h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Sermones Públicos</h2>
      
      <div className="flex flex-col md:flex-row gap-4 flex-1">
        {/* Lista de sermones */}
        <div className="md:w-1/3 bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-3 text-gray-700">Sermones Disponibles ({sermonesPublicos.length})</h3>
          <div className="space-y-2 max-h-64 md:max-h-full overflow-y-auto">
            {sermonesPublicos.map((sermon) => (
              <button
                key={sermon.id}
                onClick={() => handleSermonClick(sermon)}
                className={`w-full text-left p-3 rounded-md transition-colors ${
                  sermonSeleccionado?.id === sermon.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white hover:bg-gray-100 text-gray-800'
                }`}
              >
                <div className="font-medium text-sm">{sermon.title}</div>
                <div className="text-xs opacity-70 mt-1">
                  {sermon.fechaPublicacion?.seconds 
                    ? new Date(sermon.fechaPublicacion.seconds * 1000).toLocaleDateString()
                    : 'Fecha no disponible'
                  }
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Contenido del sermón seleccionado */}
        <div className="md:w-2/3 bg-gray-50 rounded-lg p-4 overflow-y-auto">
          {sermonSeleccionado ? (
            <div>
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{sermonSeleccionado.title}</h3>
                <div className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">Tipo:</span> {sermonSeleccionado.type || 'No especificado'}
                  <span className="mx-2">•</span>
                  <span className="font-medium">Publicado:</span> {' '}
                  {sermonSeleccionado.fechaPublicacion?.seconds 
                    ? new Date(sermonSeleccionado.fechaPublicacion.seconds * 1000).toLocaleDateString()
                    : 'Fecha no disponible'
                  }
                </div>
              </div>

              <div className="prose max-w-none">
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Introducción:</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {sermonSeleccionado.introduction || 'Sin introducción disponible.'}
                  </p>
                </div>

                {sermonSeleccionado.ideas && sermonSeleccionado.ideas.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Ideas Principales:</h4>
                    <ul className="list-disc list-inside space-y-2">
                      {sermonSeleccionado.ideas.map((idea, index) => (
                        <li key={index} className="text-gray-600">{idea}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Contenido Principal:</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {sermonSeleccionado.content || 'Sin contenido disponible.'}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Conclusión:</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {sermonSeleccionado.conclusion || 'Sin conclusión disponible.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Selecciona un sermón para ver su contenido</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SermonDelDia;
