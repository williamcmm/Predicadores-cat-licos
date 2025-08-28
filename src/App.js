import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/ui/Header';
import PanelResizer from './components/ui/PanelResizer';
import Sidebar from './components/ui/Sidebar';
import SermonEditor from './components/sermon/SermonEditor';
import ResourcePanel from './components/resources/ResourcePanel';
import SermonStudyView from './components/sermon/SermonStudyView';
import SermonPreachingView from './components/sermon/SermonPreachingView';
import MiBiblioteca from './components/biblioteca/MiBiblioteca';
import { useAuth } from './context/AuthContext';
import { guardarSermon } from './services/database/firestoreService';

const getInitialSermonState = () => ({
  title: '',
  introduction: { presentation: '', motivation: '' },
  ideas: [],
  imperatives: '',
});

function App() {
  const { currentUser } = useAuth();
  const [leftPanelWidth, setLeftPanelWidth] = useState(() => {
    const storedWidth = localStorage.getItem('leftPanelWidth');
    return storedWidth ? parseFloat(storedWidth) : 60;
  });
  const [modo, setModo] = useState('edicion');
  const [showBiblioteca, setShowBiblioteca] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);

  const [sermon, setSermon] = useState(() => {
    if (!currentUser) {
      localStorage.removeItem('currentSermon');
      return getInitialSermonState();
    }
    try {
      const savedSermon = localStorage.getItem('currentSermon');
      if (savedSermon) {
        const parsed = JSON.parse(savedSermon);
        if (parsed && typeof parsed === 'object' && parsed.title !== undefined) {
          return parsed;
        }
      }
    } catch (error) {
      console.error("Error parsing sermon from localStorage:", error);
    }
    return getInitialSermonState();
  });

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSave = useCallback(async () => {
    if (!currentUser || !sermon.title) {
      return;
    }
    setIsSaving(true);
    try {
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

  useEffect(() => {
    const handler = setTimeout(() => {
      if (currentUser && sermon.title) {
        handleSave();
      }
    }, 2000);

    return () => {
      clearTimeout(handler);
    };
  }, [sermon, currentUser, handleSave]);

  useEffect(() => {
    if (!currentUser) {
      localStorage.removeItem('currentSermon');
      setSermon(getInitialSermonState());
    }
  }, [currentUser]);

  useEffect(() => {
    const handleSermonUpdate = (event) => {
      const newSermonData = event.detail;
      if (!newSermonData || typeof newSermonData !== 'object') {
        console.error("Evento 'insertSermonIntoEditor' recibió datos inválidos:", newSermonData);
        alert("La IA devolvió un formato de sermón inesperado. No se pudo cargar.");
        return;
      }

      const finalSermon = {
        ...getInitialSermonState(),
        ...newSermonData,
        introduction: {
          ...getInitialSermonState().introduction,
          ...(newSermonData.introduction || {})
        },
        ideas: (newSermonData.ideas || []).map((idea, index) => ({
          id: idea.id || Date.now() + index,
          h1: idea.h1 || '',
          elementoApoyo: {
            tipo: (idea.elementoApoyo && idea.elementoApoyo.tipo) || 'cita_biblica',
            contenido: (idea.elementoApoyo && idea.elementoApoyo.contenido) || ''
          },
          disparadores: (idea.disparadores || []).map((disp, dIndex) => ({
            id: disp.id || Date.now() + index + dIndex,
            disparador: disp.disparador || '',
            parrafo: disp.parrafo || ''
          }))
        }))
      };

      setSermon(finalSermon);
      setModo('edicion');
    };

    const handleStartManualSermon = (event) => {
      const { topic } = event.detail;
      setSermon({ ...getInitialSermonState(), title: topic || '' });
      setModo('edicion');
    };

    window.addEventListener('insertSermonIntoEditor', handleSermonUpdate);
    window.addEventListener('startManualSermonFromResources', handleStartManualSermon);

    return () => {
      window.removeEventListener('insertSermonIntoEditor', handleSermonUpdate);
      window.removeEventListener('startManualSermonFromResources', handleStartManualSermon);
    };
  }, []);

  const handleClearSermon = () => {
    setSermon(getInitialSermonState());
    setModo('edicion');
  };

  const handleResize = (newWidth) => {
    setLeftPanelWidth(newWidth);
  };

  const toggleBiblioteca = () => {
    setShowBiblioteca(!showBiblioteca);
  };

  const handleOpenSermon = (sermonToOpen) => {
    setSermon(sermonToOpen);
    setModo('edicion');
    setShowBiblioteca(false);
  };

  const rightPanelWidth = 100 - leftPanelWidth;

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header onToggleBiblioteca={toggleBiblioteca} />
      <div className={`flex flex-1 overflow-hidden ${isSmallScreen ? 'flex-col' : 'flex-row'}`}>
        <div
          className="bg-white p-4 md:p-6 overflow-y-auto flex flex-col"
          style={{ width: isSmallScreen ? '100%' : `${leftPanelWidth}%` }}
        >
          <Sidebar 
            modo={modo} 
            setModo={setModo} 
            onClearSermon={handleClearSermon} 
            onSave={handleSave} 
            isSaving={isSaving} 
            lastSaved={lastSaved} 
          />
          <div className="flex-1 mt-4">
            {modo === 'edicion' && (
              <SermonEditor sermon={sermon} setSermon={setSermon} />
            )}
          </div>
        </div>

        {!isSmallScreen && (
            <PanelResizer
                initialLeftWidth={60}
                minWidth={10}
                maxWidth={90}
                onResize={handleResize}
            />
        )}

        <div
          className="bg-[#F8F9FA] p-4 md:p-5 overflow-y-auto"
          style={{ width: isSmallScreen ? '100%' : `${rightPanelWidth}%` }}
        >
          <ResourcePanel />
        </div>
      </div>

      {modo === 'estudio' && (
        <SermonStudyView sermon={sermon} onClose={() => setModo('edicion')} />
      )}
      {modo === 'predicacion' && (
        <SermonPreachingView sermon={sermon} onClose={() => setModo('edicion')} />
      )}
      {showBiblioteca && <MiBiblioteca onClose={toggleBiblioteca} onOpenSermon={handleOpenSermon} />}
    </div>
  );
}

export default App;