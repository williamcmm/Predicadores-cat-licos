import { SlOptionsVertical } from "react-icons/sl";
import { PublishButton } from "./PublishButton";
import { IoBook, IoCopy, IoTrash } from "react-icons/io5";
import {
  eliminarSermon,
  guardarSermon,
} from "@/services/database/firestoreService";
import { useEffect, useState } from "react";

export const MenuDesplegable = ({
  sermon,
  onOpenSermon,
  onCloseBiblioteca,
  isSuperAdmin,
  sermonesPublicados,
  setSermonesPublicados,
  sermones,
  setSermones,
}) => {
  const [openMenuId, setOpenMenuId] = useState(null); // Para controlar qué menú está abierto

  const handleOpenSermon = (sermon) => {
    onOpenSermon(sermon);
    onCloseBiblioteca();
  };

  const handleDeleteSermon = async (sermonId) => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar este sermón? Esta acción no se puede deshacer."
      )
    ) {
      try {
        await eliminarSermon(sermonId);
        setSermones(sermones.filter((s) => s.id !== sermonId));
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
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openMenuId]);

  return (
    <div className="absolute top-3 right-3 self-end sm:self-center">
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleMenu(sermon.id);
        }}
        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
        title="Opciones del sermón"
      >
        <SlOptionsVertical />
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
              <IoBook size={20} /> Abrir
            </button>

            <button
              onClick={() => {
                handleDuplicateSermon(sermon);
                closeMenu();
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 flex items-center gap-2"
            >
              <IoCopy size={20} /> Duplicar
            </button>

            {isSuperAdmin && (
              <PublishButton
                sermon={sermon}
                sermonesPublicados={sermonesPublicados}
                setSermonesPublicados={setSermonesPublicados}
                closeMenu={closeMenu}
              />
            )}

            <hr className="my-1 border-gray-200" />
            <button
              onClick={() => {
                handleDeleteSermon(sermon.id);
                closeMenu();
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2"
            >
              <IoTrash size={20} /> Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
