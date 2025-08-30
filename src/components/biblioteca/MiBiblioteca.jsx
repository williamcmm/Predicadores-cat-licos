import React, { useState, useEffect, useMemo } from 'react';
import { obtenerSermones, eliminarSermon, guardarSermon } from '../../services/database/firestoreService';
import { useAuth } from '../../context/AuthContext';

const MiBiblioteca = ({ onClose, onOpenSermon }) => {
  const { currentUser } = useAuth();
  const [sermones, setSermones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('reciente');

  const fetchSermones = async () => {
    if (currentUser) {
      try {
        const userSermons = await obtenerSermones(currentUser.uid);
        setSermones(userSermons);
      } catch (error) {
        console.error("Error fetching sermons:", error);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSermones();
  }, [currentUser]);

  const handleOpenSermon = (sermon) => {
    onOpenSermon(sermon);
    onClose();
  };

  const handleDeleteSermon = async (sermonId) => {
    if (window.confirm("Â¿EstÃ¡s seguro de que quieres eliminar este sermÃ³n? Esta acciÃ³n no se puede deshacer.")) {
      try {
        await eliminarSermon(sermonId);
        setSermones(sermones.filter(s => s.id !== sermonId));
      } catch (error) {
        console.error("Error deleting sermon:", error);
        alert("Hubo un error al eliminar el sermÃ³n.");
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
      alert("Hubo un error al duplicar el sermÃ³n.");
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full md:w-3/4 lg:w-2/3 h-5/6 p-6 flex flex-col">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold">Mi Biblioteca de Sermones</h2>
          <button onClick={onClose} className="text-2xl font-bold">&times;</button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <input 
            type="text"
            placeholder="Buscar por tÃ­tulo..."
            className="px-4 py-2 border rounded-md w-full sm:w-1/2"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="px-4 py-2 border rounded-md w-full sm:w-auto"
            onChange={(e) => setSortOrder(e.target.value)}
            value={sortOrder}
          >
            <option value="reciente">MÃ¡s recientes</option>
            <option value="antiguo">MÃ¡s antiguos</option>
            <option value="titulo">TÃ­tulo (A-Z)</option>
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
                    <h3 className="font-bold text-lg">{sermon.title}</h3>
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
  );
};

export default MiBiblioteca;



