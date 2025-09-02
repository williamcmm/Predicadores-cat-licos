import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { obtenerSermones, eliminarSermon, guardarSermon, publicarSermon, despublicarSermon, verificarSermonPublicado, encontrarSermonPublicoPorOriginal } from '../../services/database/firestoreService';
import { useAuth } from '../../context/AuthContext';

const MiBiblioteca = ({ onClose, onOpenSermon, isSubView = false }) => {
  const { currentUser } = useAuth();
  const [sermones, setSermones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('reciente');
  const [sermonesPublicados, setSermonesPublicados] = useState(new Set());
  const [openMenuId, setOpenMenuId] = useState(null); // Para controlar qué menú está abierto

  // Verificar si el usuario es super admin
  const isSuperAdmin = currentUser?.customClaims?.role === 'super_admin' || currentUser?.email === 'william.comunidad@gmail.com';

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
        console.log('🔄 Iniciando publicación de sermón:', sermon.id, sermon.title);
        await publicarSermon(sermon);
        console.log('✅ Sermón publicado exitosamente en Firestore');
        
        // Solo actualizar el estado de sermones publicados, NO recargar la lista
        setSermonesPublicados(prev => new Set(prev).add(sermon.id));
        console.log('📊 Estado de sermones publicados actualizado');
        
        // Disparar evento personalizado para actualizar SermonDelDia
        const event = new CustomEvent('sermonPublicado', { 
          detail: { sermonId: sermon.id, action: 'published', timestamp: Date.now() } 
        });
        console.log('📡 Disparando evento personalizado:', event.detail);
        window.dispatchEvent(event);
        
        // Agregar un pequeño delay y luego disparar otro evento como backup
        setTimeout(() => {
          console.log('🔄 Disparando evento de backup después de 2 segundos...');
          window.dispatchEvent(new CustomEvent('sermonPublicado', { 
            detail: { sermonId: sermon.id, action: 'published', timestamp: Date.now(), isBackup: true } 
          }));
        }, 2000);
        
        alert("¡Sermón publicado exitosamente! Ahora aparecerá en 'Sermones Públicos' para todos los usuarios.");
      } catch (error) {
        console.error("❌ Error publishing sermon:", error);
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
          // Solo actualizar el estado de sermones publicados, NO recargar la lista
          setSermonesPublicados(prev => {
            const newSet = new Set(prev);
            newSet.delete(sermonId);
            return newSet;
          });
          
          // Disparar evento personalizado para actualizar SermonDelDia
          window.dispatchEvent(new CustomEvent('sermonPublicado', { 
            detail: { sermonId: sermonId, action: 'unpublished' } 
          }));
          
          alert("Sermón despublicado exitosamente. Ya no aparecerá en 'Sermones Públicos'.");
        } else {
          alert("No se pudo encontrar el sermón público para despublicar.");
        }
      } catch (error) {
        console.error("Error unpublishing sermon:", error);
        alert("Hubo un error al despublicar el sermón.");
      }
    }
  };

  // Funciones para manejar el menú desplegable
  const toggleMenu = (sermonId) => {
    setOpenMenuId(openMenuId === sermonId ? null : sermonId);
  };

  const closeMenu = () => {
    setOpenMenuId(null);
  };

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => {
      closeMenu();
    };
    
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openMenuId]);

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
                    {/* Menú desplegable de acciones */}
                    <div className="relative self-end sm:self-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMenu(sermon.id);
                        }}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                        title="Opciones del sermón"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                        </svg>
                      </button>
                      
                      {/* Menú desplegable */}
                      {openMenuId === sermon.id && (
                        <div 
                          className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="py-1">
                            <button 
                              onClick={() => {
                                handleOpenSermon(sermon);
                                closeMenu();
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
                            >
                              <span>📖</span> Abrir
                            </button>
                            
                            <button 
                              onClick={() => {
                                handleDuplicateSermon(sermon);
                                closeMenu();
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 flex items-center gap-2"
                            >
                              <span>📄</span> Duplicar
                            </button>
                            
                            {isSuperAdmin && (
                              <>
                                <hr className="my-1 border-gray-200" />
                                {sermonesPublicados.has(sermon.id) ? (
                                  <button 
                                    onClick={() => {
                                      handleDespublicarSermon(sermon.id);
                                      closeMenu();
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 flex items-center gap-2"
                                  >
                                    <span>🔒</span> Despublicar
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => {
                                      handlePublicarSermon(sermon);
                                      closeMenu();
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2"
                                  >
                                    <span>🌍</span> Hacer Público
                                  </button>
                                )}
                              </>
                            )}
                            
                            <hr className="my-1 border-gray-200" />
                            <button 
                              onClick={() => {
                                handleDeleteSermon(sermon.id);
                                closeMenu();
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2"
                            >
                              <span>🗑️</span> Eliminar
                            </button>
                          </div>
                        </div>
                      )}
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
                      {/* Menú desplegable de acciones */}
                      <div className="relative self-end sm:self-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMenu(sermon.id);
                          }}
                          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                          title="Opciones del sermón"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                          </svg>
                        </button>
                        
                        {/* Menú desplegable */}
                        {openMenuId === sermon.id && (
                          <div 
                            className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="py-1">
                              <button 
                                onClick={() => {
                                  handleOpenSermon(sermon);
                                  closeMenu();
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
                              >
                                <span>📖</span> Abrir
                              </button>
                              
                              <button 
                                onClick={() => {
                                  handleDuplicateSermon(sermon);
                                  closeMenu();
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 flex items-center gap-2"
                              >
                                <span>📄</span> Duplicar
                              </button>
                              
                              {isSuperAdmin && (
                                <>
                                  <hr className="my-1 border-gray-200" />
                                  {sermonesPublicados.has(sermon.id) ? (
                                    <button 
                                      onClick={() => {
                                        handleDespublicarSermon(sermon.id);
                                        closeMenu();
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 flex items-center gap-2"
                                    >
                                      <span>🔒</span> Despublicar
                                    </button>
                                  ) : (
                                    <button 
                                      onClick={() => {
                                        handlePublicarSermon(sermon);
                                        closeMenu();
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2"
                                    >
                                      <span>🌍</span> Hacer Público
                                    </button>
                                  )}
                                </>
                              )}
                              
                              <hr className="my-1 border-gray-200" />
                              <button 
                                onClick={() => {
                                  handleDeleteSermon(sermon.id);
                                  closeMenu();
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2"
                              >
                                <span>🗑️</span> Eliminar
                              </button>
                            </div>
                          </div>
                        )}
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