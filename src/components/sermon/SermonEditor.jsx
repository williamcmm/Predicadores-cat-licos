import React, { useState, useEffect, useCallback } from 'react';
import SermonIdea from './SermonIdea';
import SermonSaveButton from './SermonSaveButton';
import { guardarSermon } from '../../services/database/firestoreService';
import { useAuth } from '../../context/AuthContext';

const SermonEditor = ({ sermon, setSermon }) => {
  const { currentUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Auto-save effect
  useEffect(() => {
    const handler = setTimeout(() => {
      if (currentUser && sermon.title) { // Only auto-save if logged in and sermon has a title
        handleSave();
      }
    }, 2000); // Debounce for 2 seconds

    return () => {
      clearTimeout(handler);
    };
  }, [sermon, currentUser]); // Re-run effect when sermon or user changes

  // Save to localStorage on every sermon change
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentSermon', JSON.stringify(sermon));
    }
  }, [sermon, currentUser]);

  const handleSave = useCallback(async () => {
    if (!currentUser) {
      console.log('User not logged in. Cannot save sermon.');
      return;
    }
    setIsSaving(true);
    try {
      // Add user ID to sermon data before saving
      const sermonToSave = { ...sermon, userId: currentUser.uid, createdAt: new Date() };
      const docId = await guardarSermon(sermonToSave);
      setLastSaved(new Date());
      console.log('Sermon saved with ID:', docId);
    } catch (error) {
      console.error('Error saving sermon:', error);
    } finally {
      setIsSaving(false);
    }
  }, [sermon, currentUser]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    if (id === 'sermonTitle') {
      setSermon({ ...sermon, title: value });
    } else if (id === 'presentation') {
      setSermon({ ...sermon, introduction: { ...sermon.introduction, presentation: value } });
    } else if (id === 'motivation') {
      setSermon({ ...sermon, introduction: { ...sermon.introduction, motivation: value } });
    } else if (id === 'imperatives') {
      setSermon({ ...sermon, imperatives: value });
    }
  };

  const addIdea = () => {
    const newId = sermon.ideas.length > 0 ? Math.max(...sermon.ideas.map(idea => idea.id)) + 1 : 1;
    setSermon({
      ...sermon,
      ideas: [
        ...sermon.ideas,
        {
          id: newId,
          h1: '',
          elementType: 'cita_biblica',
          elementContent: '',
          disparadores: [{ id: 1, trigger: '', paragraph: '' }],
        },
      ],
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

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-end mb-4">
        <SermonSaveButton onSave={handleSave} isSaving={isSaving} lastSaved={lastSaved} />
      </div>

      {/* TÍTULO DEL SERMÓN */}
      <div className="mb-6">
        <label htmlFor="sermonTitle" className="block text-gray-700 text-sm font-semibold mb-2 uppercase">
          TÍTULO DEL SERMÓN
        </label>
        <input
          type="text"
          id="sermonTitle"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Escriba aquí un título atractivo para su sermón"
          value={sermon.title}
          onChange={handleInputChange}
        />
      </div>

      {/* INTRODUCCIÓN */}
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-semibold mb-2 uppercase">
          INTRODUCCIÓN
        </label>
        <div className="ml-4 border-l-2 border-gray-200 pl-4">
          {/* B.1 Presentación del Tema */}
          <div className="mb-4">
            <label htmlFor="presentation" className="block text-gray-600 text-sm font-medium mb-2">
              Presentación del Tema
            </label>
            <textarea
              id="presentation"
              rows="3"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ponga aquí cómo va a presentar el tema a la audiencia"
              value={sermon.introduction.presentation}
              onChange={handleInputChange}
            ></textarea>
          </div>

          {/* B.2 Motivación Inicial */}
          <div className="mb-4">
            <label htmlFor="motivation" className="block text-gray-600 text-sm font-medium mb-2">
              Motivación Inicial
            </label>
            <textarea
              id="motivation"
              rows="3"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ponga aquí texto que genere expectativa e interés en los oyentes"
              value={sermon.introduction.motivation}
              onChange={handleInputChange}
            ></textarea>
          </div>
        </div>
      </div>

      {/* IDEAS PRINCIPALES */}
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-semibold mb-2 uppercase">
          IDEAS PRINCIPALES
        </label>
        {sermon.ideas.map((idea) => (
          <SermonIdea
            key={idea.id}
            idea={idea}
            onUpdate={updateIdea}
            onDelete={deleteIdea}
          />
        ))}
        <button
          onClick={addIdea}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Añadir Nueva Idea Principal
        </button>
      </div>

      {/* IMPERATIVOS */}
      <div className="mb-6">
        <label htmlFor="imperatives" className="block text-gray-700 text-sm font-semibold mb-2 uppercase">
          IMPERATIVOS
        </label>
        <textarea
          id="imperatives"
          rows="4"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Ponga aquí acciones concretas que deben tomar (conclusión lógica, no moralismo)"
          value={sermon.imperatives}
          onChange={handleInputChange}
        ></textarea>
      </div>
    </div>
  );
};

export default SermonEditor;