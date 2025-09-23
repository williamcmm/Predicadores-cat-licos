import { useState, useEffect, useCallback } from "react";
import { SermonIdea } from "../../ideas/SermonIdea";
import ConfirmationModal from "@/components/sermon/views/editor/ConfirmationModal";
import { EditorActionBar } from "@/components/sermon/views/editor/EditorActionBar";
import { ScrollToTopButton } from "@/components/ui/ScrollToTop";
import { FloatingSaveButton } from "@/components/ui/FloatingSaveButton";
import { useAuth } from "@/context/AuthContext";
import { getEmptyIdea } from "@/models/sermonModel";
import { guardarSermon } from "@/services/database/firestoreService";
import { SermonNavigateIndex } from "../../ui/SermonNavigateIndex";
import {useViewModeStore} from "@/store/view-mode-store";
import { scrollIntoView } from "@/utils/scrollIntoView";

const SermonEditor = ({ 
  sermon, 
  setSermon, 
  onClearSermon
}) => {
  const { currentUser } = useAuth();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ideaToDelete, setIdeaToDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const { scrollTarget, clearScrollTarget } = useViewModeStore();
  
  // Funcionalidad para scroll automatico al darle click a una idea en el preaching mode o study mode
  useEffect(() => {
    if (scrollTarget) {
      // slight delay to allow DOM to update
      setTimeout(() => {
        scrollIntoView(scrollTarget);
        clearScrollTarget();
      }, 120);
    }
  }, [scrollTarget, clearScrollTarget]);

  // Save to localStorage on every sermon change
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentSermon", JSON.stringify(sermon));
    }
  }, [sermon, currentUser]);

  // Función de guardado interna
  const handleSave = useCallback(async () => {
    if (!currentUser || !sermon.title) {
      return { success: false, error: "No hay usuario o título" };
    }
    setIsSaving(true);
    try {
      const sermonToSave = {
        ...sermon,
        userId: currentUser.uid,
        // Solo asignar createdAt si es un sermón nuevo (sin ID)
        createdAt: sermon.id ? sermon.createdAt : new Date(),
        // Si es una copia de un sermón público, asignar fecha de modificación
        modifiedAt: sermon.basadoEnSermonPublico
          ? new Date()
          : sermon.modifiedAt || new Date(),
      };

      const docId = await guardarSermon(sermonToSave);
      setLastSaved(new Date());

      // IMPORTANTE: Actualizar el estado del sermón con el nuevo ID
      if (!sermon.id || sermon.basadoEnSermonPublico) {
        setSermon((prevSermon) => {
          // Crear una copia limpia sin campos undefined
          const {
            basadoEnSermonPublico,
            autorOriginalNombre,
            ...sermonLimpio
          } = prevSermon;
          return {
            ...sermonLimpio,
            id: docId,
            userId: currentUser.uid,
          };
        });
      }

      return { success: true, docId };
    } catch (error) {
      console.error("❌ Error saving sermon:", error);
      return { success: false, error: error.message };
    } finally {
      setIsSaving(false);
    }
  }, [sermon, currentUser, setSermon]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    if (id === "sermonTitle") {
      setSermon({ ...sermon, title: value });
    } else if (id === "presentation") {
      setSermon({
        ...sermon,
        introduction: { ...sermon.introduction, presentation: value },
      });
    } else if (id === "motivation") {
      setSermon({
        ...sermon,
        introduction: { ...sermon.introduction, motivation: value },
      });
    } else if (id === "imperatives") {
      setSermon({ ...sermon, imperatives: value });
    }
  };

  const addIdea = () => {
    const newIdea = getEmptyIdea();
    setSermon({
      ...sermon,
      ideas: [...sermon.ideas, newIdea],
    });
  };

  const updateIdea = (updatedIdea) => {
    setSermon({
      ...sermon,
      ideas: sermon.ideas.map((idea) =>
        idea.id === updatedIdea.id ? updatedIdea : idea
      ),
    });
  };

  const deleteIdea = (id) => {
    setSermon({
      ...sermon,
      ideas: sermon.ideas.filter((idea) => idea.id !== id),
    });
  };

  const handleDeleteRequest = (id) => {
    setIdeaToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (ideaToDelete) {
      deleteIdea(ideaToDelete);
      setIdeaToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
      >
        <p>
          ¿Está seguro que desea eliminar esta idea? Esta acción no se puede
          deshacer.
        </p>
      </ConfirmationModal>

      <div className="p-6 bg-gray-50 rounded-lg overflow-auto">
        {/* ACCIONES DEL EDITOR */}
        <EditorActionBar
          onClearSermon={onClearSermon}
          onSave={handleSave}
          isSaving={isSaving}
          lastSaved={lastSaved}
        />

        {/* INDICE DE IDEAS: enlaces tipo 'etiqueta' que hacen scroll a cada idea */}
        <SermonNavigateIndex sermon={sermon} />

        {/* TÍTULO DEL SERMÓN */}
        <div className="mb-8">
          <label
            htmlFor="sermonTitle"
            className="block text-gray-800 text-base font-bold my-4 uppercase"
          >
            TÍTULO DEL SERMÓN
          </label>
          <input
            type="text"
            id="sermonTitle"
            className="w-full p-4 border-2 border-gray-300 rounded-lg text-xl font-semibold text-gray-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            placeholder="Escriba aquí un título atractivo para su sermón"
            value={sermon.title}
            onChange={handleInputChange}
          />
        </div>

        {/* INTRODUCCIÓN */}
        <div className="mb-8 p-6 bg-white rounded-xl shadow-md">
          <label className="block text-gray-800 text-base font-bold mb-4 uppercase">
            INTRODUCCIÓN
          </label>
          <div className="space-y-6">
            {/* B.1 Presentación del Tema */}
            <div>
              <label
                htmlFor="presentation"
                className="block text-gray-600 text-sm font-semibold mb-2"
              >
                Presentación del Tema
              </label>
              <textarea
                id="presentation"
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ponga aquí cómo va a presentar el tema a la audiencia"
                value={sermon.introduction.presentation}
                onChange={handleInputChange}
              ></textarea>
            </div>

            {/* B.2 Motivación Inicial */}
            <div>
              <label
                htmlFor="motivation"
                className="block text-gray-600 text-sm font-semibold mb-2"
              >
                Motivación Inicial
              </label>
              <textarea
                id="motivation"
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ponga aquí texto que genere expectativa e interés en los oyentes"
                value={sermon.introduction.motivation}
                onChange={handleInputChange}
              ></textarea>
            </div>
          </div>
        </div>

        {/* IDEAS PRINCIPALES */}
        <div className="mb-8">
          <label className="block text-gray-800 text-base font-bold mb-4 uppercase overflow-auto">
            IDEAS PRINCIPALES
          </label>
          <div className="space-y-8">
            {sermon.ideas.map((idea, index) => (
              <SermonIdea
                key={idea.id}
                idea={idea}
                index={index}
                onUpdate={updateIdea}
                onDelete={handleDeleteRequest}
              />
            ))}
          </div>
          <button
            onClick={addIdea}
            className="mt-6 w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            + Añadir Nueva Idea Principal
          </button>
        </div>

        {/* IMPERATIVOS */}
        <div className="p-6 bg-white rounded-xl shadow-md">
          <label
            htmlFor="imperatives"
            className="block text-gray-800 text-base font-bold mb-4 uppercase"
          >
            IMPERATIVOS
          </label>
          <textarea
            id="imperatives"
            rows="4"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ponga aquí acciones concretas que deben tomar (conclusión lógica, no moralismo)"
            value={sermon.imperatives}
            onChange={handleInputChange}
          ></textarea>
        </div>
      </div>

      {/* Botones flotantes */}
      <ScrollToTopButton />
      <FloatingSaveButton
        onSave={handleSave}
        isSaving={isSaving}
        lastSaved={lastSaved}
      />
    </>
  );
};

export default SermonEditor;
