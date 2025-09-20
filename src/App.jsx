import { useState, useEffect, useCallback, useRef } from "react";
import Header from "./components/ui/Header";
import PanelResizer from "./components/ui/PanelResizer";
import { EditorActionButtons } from "./components/ui/EditorActionButtons";
import SermonEditor from "./components/sermon/SermonEditor";
import ResourcePanel from "./components/resources/ResourcePanel";
import SermonStudyView from "./components/sermon/SermonStudyView";
import SermonPreachingView from "./components/sermon/SermonPreachingView";
import Biblioteca from "./components/biblioteca/Biblioteca";
import AdminPanel from "./components/admin/AdminPanel";
import {BottomNavBar} from "./components/ui/BottomNavBar";
import {MobileResourcesModal} from "./components/ui/MobileResourcesModal";
import { useAuth } from "./context/AuthContext";
import storageService from "./services/storage/storageService";
import {
  getEmptySermon,
  mergeSermonData,
  validateSermonStructure,
  normalizeSermon,
} from "./models/sermonModel";
import { guardarSermon } from "./services/database/firestoreService";
import { esAdministrador } from "./services/admin/userService";
import { ScrollToTopButton } from "./components/ui/ScrollToTop";
import { FloatingSaveButton } from "./components/ui/FloatingSaveButton";
import { useScrollViewStore } from "./store/scroll-view-store";

function App() {
  const { currentUser } = useAuth();
  const initScrollTracking = useScrollViewStore((state) => state.init);
  const setScrollElement = useScrollViewStore(
    (state) => state.setScrollElement
  );
  const editorContainerRef = useRef(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(() => {
    const storedWidth = localStorage.getItem("leftPanelWidth");
    return storedWidth ? parseFloat(storedWidth) : 60;
  });
  const [modo, setModo] = useState("edicion");
  const [showBiblioteca, setShowBiblioteca] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMobileResources, setShowMobileResources] = useState(false);

  const [sermon, setSermon] = useState(() => {
    if (!currentUser) {
      localStorage.removeItem("currentSermon");
      return getEmptySermon();
    }
    try {
      const savedSermon = localStorage.getItem("currentSermon");
      if (savedSermon) {
        const parsed = JSON.parse(savedSermon);
        if (
          parsed &&
          typeof parsed === "object" &&
          parsed.title !== undefined
        ) {
          return normalizeSermon(parsed);
        }
      }
    } catch (error) {
      console.error("Error parsing sermon from localStorage:", error);
    }
    return getEmptySermon();
  });

  // Manejo dinámico del responsive
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Inicializar tracking del scroll
  useEffect(() => {
    const cleanup = initScrollTracking();
    return cleanup;
  }, [initScrollTracking]);

  // Configurar el elemento de scroll cuando cambia el modo
  useEffect(() => {
    if (modo === "edicion" && editorContainerRef.current) {
      setScrollElement(editorContainerRef.current);
    }
  }, [modo, setScrollElement]);

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

  // Carga inicial inteligente del sermón - PREVENIR DUPLICACIÓN
  useEffect(() => {
    const loadInitialSermon = async () => {
      if (!currentUser) {
        // LIMPIEZA: Remover datos de usuario anterior para prevenir duplicación
        storageService.clearUserData();
        localStorage.removeItem("currentSermon");
        localStorage.removeItem("sermonesCache");
        localStorage.removeItem("cacheTimestamp");
        setSermon(storageService.getInitialSermonState());
        return;
      }

      try {
        const initialSermon = await storageService.loadInitialSermon(
          currentUser.uid
        );
        setSermon(initialSermon);
      } catch (error) {
        console.error("Error cargando sermón inicial:", error);
        setSermon(storageService.getInitialSermonState());
      }
    };

    loadInitialSermon();
  }, [currentUser]);

  useEffect(() => {
    const handleSermonUpdate = (event) => {
      const newSermonData = event.detail;
      if (!newSermonData || typeof newSermonData !== "object") {
        console.error(
          "Evento 'insertSermonIntoEditor' recibió datos inválidos:",
          newSermonData
        );
        alert(
          "La IA devolvió un formato de sermón inesperado. No se pudo cargar."
        );
        return;
      }

      // Usar la función centralizada para combinar datos
      const finalSermon = mergeSermonData(newSermonData);

      // Validar estructura antes de usar
      const errors = validateSermonStructure(finalSermon);
      if (errors.length > 0) {
        console.warn("Errores en estructura del sermón:", errors);
        // Continúa pero con advertencias
      }

      setSermon(finalSermon);
      setModo("edicion");
    };

    const handleStartManualSermon = (event) => {
      const { topic } = event.detail;
      const newSermon = {
        ...getEmptySermon(),
        title: topic || "",
      };
      setSermon(newSermon);
      setModo("edicion");
    };

    window.addEventListener("insertSermonIntoEditor", handleSermonUpdate);
    window.addEventListener(
      "startManualSermonFromResources",
      handleStartManualSermon
    );

    return () => {
      window.removeEventListener("insertSermonIntoEditor", handleSermonUpdate);
      window.removeEventListener(
        "startManualSermonFromResources",
        handleStartManualSermon
      );
    };
  }, []);

  const handleClearSermon = () => {
    setSermon(getEmptySermon());
    setModo("edicion");
  };

  const handleResize = (newWidth) => {
    setLeftPanelWidth(newWidth);
  };

  const toggleBiblioteca = () => {
    setShowBiblioteca(!showBiblioteca);
  };

  const toggleAdminPanel = () => {
    setShowAdminPanel(!showAdminPanel);
  };

  const handleOpenSermon = (sermonToOpen) => {
    // Si es un sermón público (tiene autorOriginal), crear una copia para el usuario actual
    if (sermonToOpen.esPublico || sermonToOpen.autorOriginal) {
      const sermonCopy = {
        ...sermonToOpen,
        // Remover identificadores del sermón original para crear una copia nueva
        id: undefined,
        userId: currentUser?.uid,
        createdAt: new Date(),
        // Mantener referencia al original para fines informativos
        basadoEnSermonPublico: sermonToOpen.id,
        autorOriginalNombre: sermonToOpen.nombreAutor || sermonToOpen.autor,
        // Marcar como copia en el título si no está ya marcado
        title: sermonToOpen.title.includes("[Copia]")
          ? sermonToOpen.title
          : `[Copia] ${sermonToOpen.title}`,
      };
      setSermon(sermonCopy);
    } else {
      // Sermón propio, abrir normalmente
      setSermon(sermonToOpen);
    }
    setModo("edicion");
    setShowBiblioteca(false);
  };

  const rightPanelWidth = isMobile ? 100 : 100 - leftPanelWidth;

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header
        onToggleBiblioteca={toggleBiblioteca}
        onOpenAdminPanel={toggleAdminPanel}
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Panel - Responsive width */}
        <div
          ref={editorContainerRef}
          className="w-full md:flex-1 bg-white p-4 md:p-6 overflow-y-auto flex flex-col relative pb-16 md:pb-4"
          style={{ width: window.innerWidth >= 768 ? `${leftPanelWidth}%` : '100%' }}
        >
          <EditorActionButtons
            modo={modo}
            setModo={setModo}
            onClearSermon={handleClearSermon}
            onSave={handleSave}
            isSaving={isSaving}
            lastSaved={lastSaved}
          />
          <div className="flex-1 mt-4 relative">
            {modo === "edicion" && (
              <>
                <SermonEditor sermon={sermon} setSermon={setSermon} />
                <ScrollToTopButton />
                <FloatingSaveButton
                  onSave={handleSave}
                  isSaving={isSaving}
                  lastSaved={lastSaved}
                />
              </>
            )}
          </div>
        </div>

        {/* Panel Resizer - Only visible on desktop */}
        <PanelResizer
          className="hidden md:block"
          initialLeftWidth={60}
          minWidth={10}
          maxWidth={90}
          onResize={handleResize}
        />

        {/* Resources Panel - Hidden on mobile, visible on desktop */}
        <div
          className="hidden md:block bg-[#F8F9FA] p-4 md:p-5 overflow-y-auto"
          style={{ width: `${rightPanelWidth}%` }}
        >
          <ResourcePanel />
        </div>
      </div>

      {/* Bottom Navigation - Only visible on mobile */}
      <BottomNavBar 
        className="md:hidden" 
        onResourcesToggle={() => setShowMobileResources(!showMobileResources)}
        isResourcesActive={showMobileResources}
      />

      {/* Mobile Resources Modal */}
      <MobileResourcesModal 
        isOpen={showMobileResources}
        onClose={() => setShowMobileResources(false)}
      />

      {modo === "estudio" && (
        <SermonStudyView sermon={sermon} onClose={() => setModo("edicion")} />
      )}
      {modo === "predicacion" && (
        <SermonPreachingView
          sermon={sermon}
          onClose={() => setModo("edicion")}
        />
      )}
      {showBiblioteca && (
        <Biblioteca
          onClose={toggleBiblioteca}
          onOpenSermon={handleOpenSermon}
        />
      )}
      {showAdminPanel && esAdministrador(currentUser) && (
        <AdminPanel onClose={toggleAdminPanel} />
      )}
    </div>
  );
}

export default App;
