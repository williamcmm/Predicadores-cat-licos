import { useState, useCallback, useEffect, useMemo } from "react";
import {
  obtenerSermones,
  verificarSermonPublicado,
} from "@/services/database/firestoreService";
import { useAuth } from "@/context/AuthContext";
import { MenuDesplegable } from "./MenuDesplegable";

export const MisSermones = ({ onCloseBiblioteca, onOpenSermon }) => {
  const { currentUser, userRole } = useAuth();
  const [sermones, setSermones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("reciente");
  const [sermonesPublicados, setSermonesPublicados] = useState(new Set());

  // Verificar si el usuario es super admin
  const isSuperAdmin =
    import.meta.env.VITE_SUPER_ADMIN?.split(",").includes(currentUser.email) ||
    currentUser.userRole === "super_admin" ||
    userRole === "super_admin";

  const fetchSermones = useCallback(async () => {
    if (currentUser) {
      try {
        // PREVENIR DUPLICACIÓN: Limpiar cache antes de cargar
        const cacheKey = `sermones_cache_${currentUser.uid}`;
        localStorage.removeItem(cacheKey);

        const userSermons = await obtenerSermones(currentUser.uid);

        // PREVENIR DUPLICACIÓN: Filtrar sermones únicos por ID
        const uniqueSermons = userSermons.filter(
          (sermon, index, self) =>
            index === self.findIndex((s) => s.id === sermon.id)
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

  const filteredAndSortedSermons = useMemo(() => {
    return sermones
      .filter((sermon) =>
        sermon.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortOrder === "reciente") {
          const dateA = a.createdAt?.seconds || 0;
          const dateB = b.createdAt?.seconds || 0;
          return dateB - dateA;
        } else if (sortOrder === "antiguo") {
          const dateA = a.createdAt?.seconds || 0;
          const dateB = b.createdAt?.seconds || 0;
          return dateA - dateB;
        } else if (sortOrder === "titulo") {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [sermones, searchTerm, sortOrder]);

  return (
    <>
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
                <li
                  key={sermon.id}
                  className="relative p-4 flex justify-between items-start sm:items-center shadow-md rounded-md hover:bg-gray-50 gap-4"
                >
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
                      Creado:{" "}
                      {sermon.createdAt && sermon.createdAt.seconds
                        ? new Date(
                            sermon.createdAt.seconds * 1000
                          ).toLocaleDateString()
                        : "Fecha no disponible"}
                    </p>
                  </div>
                  {/* Menú desplegable de acciones */}
                  <MenuDesplegable
                    sermon={sermon}
                    onOpenSermon={onOpenSermon}
                    onCloseBiblioteca={onCloseBiblioteca}
                    isSuperAdmin={isSuperAdmin}
                    sermonesPublicados={sermonesPublicados}
                    setSermonesPublicados={setSermonesPublicados}
                    sermones={sermones}
                    setSermones={setSermones}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 mt-10">
              No se encontraron sermones con ese criterio.
            </p>
          )}
        </div>
      </div>
    </>
  );
};
