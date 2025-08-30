import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Header from './components/ui/Header';
import PanelResizer from './components/ui/PanelResizer';
import Sidebar from './components/ui/Sidebar';
import SermonEditor from './components/sermon/SermonEditor';
import ResourcePanel from './components/resources/ResourcePanel';
import SermonStudyView from './components/sermon/SermonStudyView';
import SermonPreachingView from './components/sermon/SermonPreachingView';
import MiBiblioteca from './components/biblioteca/MiBiblioteca';
import BottomNavBar from './components/ui/BottomNavBar';
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
  const [activePanel, setActivePanel] = useState('editor');

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
      <div className="flex flex-1 overflow-hidden">
        {isSmallScreen ? (
          <main className="flex-1 overflow-y-auto pb-16">
            {activePanel === 'editor' && (
              <div className="bg-white p-4 h-full flex flex-col">
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
            )}
            <Transition.Root show={activePanel === 'resources'} as={Fragment}>
              <Dialog as="div" className="relative z-50" onClose={() => setActivePanel('editor')}>
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 bg-black bg-opacity-50" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                      <Transition.Child
                        as={Fragment}
                        enter="transform transition ease-in-out duration-500 sm:duration-700"
                        enterFrom="translate-x-full"
                        enterTo="translate-x-0"
                        leave="transform transition ease-in-out duration-500 sm:duration-700"
                        leaveFrom="translate-x-0"
                        leaveTo="translate-x-full"
                      >
                        <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                          <div className="flex h-full flex-col overflow-y-scroll bg-[#F8F9FA] py-6 shadow-xl">
                            <div className="px-4 sm:px-6">
                              <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                                Buscador de Recursos
                              </Dialog.Title>
                            </div>
                            <div className="relative mt-6 flex-1 px-4 sm:px-6">
                              <ResourcePanel />
                            </div>
                          </div>
                        </Dialog.Panel>
                      </Transition.Child>
                    </div>
                  </div>
                </div>
              </Dialog>
            </Transition.Root>
          </main>
        ) : (
          <>
            <div
              className="bg-white p-4 md:p-6 overflow-y-auto flex flex-col"
              style={{ width: `${leftPanelWidth}%` }}
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

            <PanelResizer
                initialLeftWidth={60}
                minWidth={10}
                maxWidth={90}
                onResize={handleResize}
            />

            <div
              className="bg-[#F8F9FA] p-4 md:p-5 overflow-y-auto"
              style={{ width: `${rightPanelWidth}%` }}
            >
              <ResourcePanel />
            </div>
          </>
        )}
      </div>

      {isSmallScreen && <BottomNavBar activePanel={activePanel} setActivePanel={setActivePanel} />}

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


