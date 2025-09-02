import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { obtenerSermones, eliminarSermon, guardarSermon, publicarSermon, despublicarSermon, verificarSermonPublicado, encontrarSermonPublicoPorOriginal } from '../../services/database/firestoreService';
import { useAuth } from '../../context/AuthContext';

const MiBiblioteca = ({ onClose, onOpenSermon, isSubView = false }) => {
  const { currentUser } = useAuth();
  const [sermones, setSermones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('reciente');
  const [sermonesPublicados, setSermonesPublicados] = useState(new Set());

  // Verificar si el usuario es super admin
  const isSuperAdmin = currentUser?.customClaims?.role === 'super_admin' || currentUser?.email === 'admin@predicador.com';

  const fetchSermones = useCallback(async () => {
    if (currentUser) {
      try {
        // PREVENIR DUPLICACIÓN: Limpiar cache antes de cargar
        const cacheKey = `sermones_cache_${currentUser.uid}`;
        localStorage.removeItem(cacheKey);
        
        const userSermons = await obtenerSermones(currentUser.uid);
        
        // PREVENIR DUPLICACIÓN: Filtrar sermones únicos por ID
        const uniqueSermons = userSermons.filter((sermon, index, self) => 
          index === self.findIndex(s => s.id === sermon.id)
        );
        
        setSermones(uniqueSermons);

        // Si es super admin, verificar cuáles sermones están publicados
        if (isSuperAdmin) {
          const publicados = new Set();
          for (const sermon of uniqueSermons) {
            try {
              const estaPublicado = await verificarSermonPublicado(sermon.id);
              if (estaPublicado) {
                publicados.add(sermon.id);
              }
            } catch (error) {
              console.error(`Error checking sermon ${sermon.id}:`, error);
            }
          }
          setSermonesPublicados(publicados);
        }
      } catch (error) {
        console.error("Error fetching sermons:", error);
      }
    }
    setLoading(false);
  }, [currentUser, isSuperAdmin]);

  useEffect(() => {
    fetchSermones();
  }, [fetchSermones]);

  const handleOpenSermon = (sermon) => {
    onOpenSermon(sermon);
    onClose();
  };

  const handleDeleteSermon = async (sermonId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este sermón? Esta acción no se puede deshacer.")) {
      try {
        await eliminarSermon(sermonId);
        setSermones(sermones.filter(s => s.id !== sermonId));
      } catch (error) {
        console.error("Error deleting sermon:", error);
        alert("Hubo un error al eliminar el sermón.");
      }
    }
  };

  const handleDuplicateSermon = async (sermon) => {
    const { id, ...sermonToDuplicate } = sermon;
    sermonToDuplicate.title = `[Copia] ${sermon.title}`;
    sermonToDuplicate.createdAt = new Date();

    try {
      const newSermonId = await guardarSermon(sermonToDuplicate);
      const newSermon = { ...sermonToDuplicate, id: newSermonId };
      setSermones([newSermon, ...sermones]);
    } catch (error) {
      console.error("Error duplicating sermon:", error);
      alert("Hubo un error al duplicar el sermón.");
    }
  };

  const handlePublicarSermon = async (sermon) => {
    if (window.confirm(`¿Deseas publicar el sermón "${sermon.title}" para que todos los usuarios puedan verlo?`)) {
      try {
        await publicarSermon(sermon);
        setSermonesPublicados(prev => new Set(prev).add(sermon.id));
        alert("¡Sermón publicado exitosamente!");
      } catch (error) {
        console.error("Error publishing sermon:", error);
        alert("Hubo un error al publicar el sermón.");
      }
    }
  };

  const handleDespublicarSermon = async (sermonId) => {
    if (window.confirm("¿Deseas despublicar este sermón? Ya no será visible para otros usuarios.")) {
      try {
        // Encontrar el ID del sermón público usando el ID original
        const sermonPublicoId = await encontrarSermonPublicoPorOriginal(sermonId);
        if (sermonPublicoId) {
          await despublicarSermon(sermonPublicoId);
          setSermonesPublicados(prev => {
            const newSet = new Set(prev);
            newSet.delete(sermonId);
            return newSet;
          });
          alert("Sermón despublicado exitosamente.");
        } else {
          alert("No se pudo encontrar el sermón público para despublicar.");
        }
      } catch (error) {
        console.error("Error unpublishing sermon:", error);
        alert("Hubo un error al despublicar el sermón.");
      }
    }
  };

  const filteredAndSortedSermons = useMemo(() => {
    return sermones
      .filter(sermon => 
        sermon.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortOrder === 'reciente') {
          const dateA = a.createdAt?.seconds || 0;
          const dateB = b.createdAt?.seconds || 0;
          return dateB - dateA;
        } else if (sortOrder === 'antiguo') {
          const dateA = a.createdAt?.seconds || 0;
          const dateB = b.createdAt?.seconds || 0;
          return dateA - dateB;
        } else if (sortOrder === 'titulo') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [sermones, searchTerm, sortOrder]);

  return (
    <>
      {isSubView ? (
        // Vista como subcomponente dentro de Biblioteca
        <div className="h-full flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <input 
              type="text"
              placeholder="Buscar por título..."
              className="px-4 py-2 border rounded-md w-full sm:w-1/2"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className="px-4 py-2 border rounded-md w-full sm:w-auto"
              onChange={(e) => setSortOrder(e.target.value)}
              value={sortOrder}
            >
              <option value="reciente">Más recientes</option>
              <option value="antiguo">Más antiguos</option>
              <option value="titulo">Título (A-Z)</option>
            </select>
          </div>

          <div className="flex-grow overflow-y-auto">
            {loading ? (
              <p>Cargando sermones...</p>
            ) : filteredAndSortedSermons.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {filteredAndSortedSermons.map((sermon) => (
                  <li key={sermon.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-gray-50 gap-4">
                    <div className="mb-4 sm:mb-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{sermon.title}</h3>
                        {isSuperAdmin && sermonesPublicados.has(sermon.id) && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            PÚBLICO
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Creado: {sermon.createdAt && sermon.createdAt.seconds ? new Date(sermon.createdAt.seconds * 1000).toLocaleDateString() : 'Fecha no disponible'}
                      </p>
                    </div>
                    <div className="flex flex-wrap space-x-2 self-end sm:self-center">
                      <button 
                        onClick={() => handleOpenSermon(sermon)}
                        className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                      >
                        Abrir
                      </button>
                      <button 
                        onClick={() => handleDuplicateSermon(sermon)}
                        className="px-3 py-1 sm:px-4 sm:py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors text-sm"
                      >
                        Duplicar
                      </button>
                      {isSuperAdmin && (
                        sermonesPublicados.has(sermon.id) ? (
                          <button 
                            onClick={() => handleDespublicarSermon(sermon.id)}
                            className="px-3 py-1 sm:px-4 sm:py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm"
                          >
                            Despublicar
                          </button>
                        ) : (
                          <button 
                            onClick={() => handlePublicarSermon(sermon)}
                            className="px-3 py-1 sm:px-4 sm:py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                          >
                            Publicar
                          </button>
                        )
                      )}
                      <button 
                        onClick={() => handleDeleteSermon(sermon.id)}
                        className="px-3 py-1 sm:px-4 sm:py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 mt-10">No se encontraron sermones con ese criterio.</p>
            )}
          </div>
        </div>
      ) : (
        // Vista como modal completo
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full md:w-3/4 lg:w-2/3 h-5/6 p-6 flex flex-col">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h2 className="text-xl sm:text-2xl font-bold">Mi Biblioteca de Sermones</h2>
              <button onClick={onClose} className="text-2xl font-bold">&times;</button>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
              <input 
                type="text"
                placeholder="Buscar por título..."
                className="px-4 py-2 border rounded-md w-full sm:w-1/2"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select 
                className="px-4 py-2 border rounded-md w-full sm:w-auto"
                onChange={(e) => setSortOrder(e.target.value)}
                value={sortOrder}
              >
                <option value="reciente">Más recientes</option>
                <option value="antiguo">Más antiguos</option>
                <option value="titulo">Título (A-Z)</option>
              </select>
            </div>

            <div className="flex-grow overflow-y-auto">
              {loading ? (
                <p>Cargando sermones...</p>
              ) : filteredAndSortedSermons.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {filteredAndSortedSermons.map((sermon) => (
                    <li key={sermon.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-gray-50 gap-4">
                      <div className="mb-4 sm:mb-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{sermon.title}</h3>
                          {isSuperAdmin && sermonesPublicados.has(sermon.id) && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              PÚBLICO
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          Creado: {sermon.createdAt && sermon.createdAt.seconds ? new Date(sermon.createdAt.seconds * 1000).toLocaleDateString() : 'Fecha no disponible'}
                        </p>
                      </div>
                      <div className="flex flex-wrap space-x-2 self-end sm:self-center">
                        <button 
                          onClick={() => handleOpenSermon(sermon)}
                          className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                        >
                          Abrir
                        </button>
                        <button 
                          onClick={() => handleDuplicateSermon(sermon)}
                          className="px-3 py-1 sm:px-4 sm:py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors text-sm"
                        >
                          Duplicar
                        </button>
                        {isSuperAdmin && (
                          sermonesPublicados.has(sermon.id) ? (
                            <button 
                              onClick={() => handleDespublicarSermon(sermon.id)}
                              className="px-3 py-1 sm:px-4 sm:py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm"
                            >
                              Despublicar
                            </button>
                          ) : (
                            <button 
                              onClick={() => handlePublicarSermon(sermon)}
                              className="px-3 py-1 sm:px-4 sm:py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                            >
                              Publicar
                            </button>
                          )
                        )}
                        <button 
                          onClick={() => handleDeleteSermon(sermon.id)}
                          className="px-3 py-1 sm:px-4 sm:py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 mt-10">No se encontraron sermones con ese criterio.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MiBiblioteca;