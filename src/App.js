import React, { useState, useEffect } from 'react';
import Header from './components/ui/Header';
import PanelResizer from './components/ui/PanelResizer';
import Sidebar from './components/ui/Sidebar';
import SermonEditor from './components/sermon/SermonEditor';
import ResourcePanel from './components/resources/ResourcePanel';
import SermonStudyView from './components/sermon/SermonStudyView';
import SermonPreachingView from './components/sermon/SermonPreachingView';
import MiBiblioteca from './components/biblioteca/MiBiblioteca';
import { useAuth } from './context/AuthContext';

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
    <div className="h-screen flex flex-col">
      <Header onToggleBiblioteca={toggleBiblioteca} />
      <div className="flex flex-1 overflow-hidden">
        <div
          className="bg-white p-6 overflow-y-auto flex flex-col"
          style={{ width: `${leftPanelWidth}%` }}
        >
          <Sidebar modo={modo} setModo={setModo} onClearSermon={handleClearSermon} />
          <div className="flex-1 mt-4">
            {modo === 'edicion' && (
              <SermonEditor sermon={sermon} setSermon={setSermon} user={currentUser} />
            )}
          </div>
        </div>

        <PanelResizer
          initialLeftWidth={60}
          minWidth={10}
          maxWidth={90}
          onResize={handleResize}
        />

        <div
          className="bg-[#F8F9FA] p-5 overflow-y-auto"
          style={{ width: `${rightPanelWidth}%` }}
        >
          <ResourcePanel />
        </div>
      </div>

      {modo === 'estudio' && (
        <SermonStudyView sermon={sermon} onClose={() => setModo('edicion')} user={currentUser} />
      )}
      {modo === 'predicacion' && (
        <SermonPreachingView sermon={sermon} onClose={() => setModo('edicion')} user={currentUser} />
      )}
      {showBiblioteca && <MiBiblioteca onClose={toggleBiblioteca} onOpenSermon={handleOpenSermon} />}
    </div>
  );
}

export default App;
