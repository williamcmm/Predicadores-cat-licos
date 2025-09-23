import { useState, useEffect, useRef } from "react";
import Header from "./components/ui/header/Header";
import PanelResizer from "./components/ui/PanelResizer";
import SermonEditor from "@/components/sermon/views/editor/SermonEditor";
import ResourcePanel from "./components/resources/ResourcePanel";
import SermonStudyView from "./components/sermon/views/full-screen/SermonStudyView";
import SermonPreachingView from "./components/sermon/views/full-screen/SermonPreachingView";
import AdminPanel from "./components/admin/AdminPanel";
import { BottomNavBar } from "./components/ui/BottomNavBar";
import { MobileResourcesModal } from "./components/ui/MobileResourcesModal";
import { useAuth } from "./context/AuthContext";
import storageService from "./services/storage/storageService";
import {
  getEmptySermon,
  mergeSermonData,
  validateSermonStructure,
} from "./models/sermonModel";
import { esAdministrador } from "./services/admin/userService";
import { useViewModeStore } from "./store/view-mode-store";
import { useScrollViewStore } from "./store/scroll-view-store";
import { useSermonStore } from "./store/sermon-store";

function App() {
  const { currentUser } = useAuth();
  const editorContainerRef = useRef(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(() => {
    const storedWidth = localStorage.getItem("leftPanelWidth");
    return storedWidth ? parseFloat(storedWidth) : 60;
  });
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMobileResources, setShowMobileResources] = useState(false);

  // STORE
  const { mode, setMode } = useViewModeStore();
  const initScrollTracking = useScrollViewStore((state) => state.init);
  const setScrollElement = useScrollViewStore(
    (state) => state.setScrollElement
  );
  const { sermon, setSermon, initSermon } = useSermonStore();

  useEffect(() => {
    // Initialize sermon when currentUser becomes available or changes
    if (typeof initSermon === 'function') {
      initSermon(currentUser);
    }
  }, [currentUser, initSermon]);

  // Manejo dinámico del responsive
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Inicializar tracking del scroll
  useEffect(() => {
    const cleanup = initScrollTracking();
    return cleanup;
  }, [initScrollTracking]);

  // Configurar el elemento de scroll cuando cambia el modo
  useEffect(() => {
    if (mode === "edicion" && editorContainerRef.current) {
      setScrollElement(editorContainerRef.current);
    }
  }, [mode, setScrollElement]);

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
      setMode("edicion");
    };

    const handleStartManualSermon = (event) => {
      const { topic } = event.detail;
      const newSermon = {
        ...getEmptySermon(),
        title: topic || "",
      };
      setSermon(newSermon);
      setMode("edicion");
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
    setMode("edicion");
  };

  const handleResize = (newWidth) => {
    setLeftPanelWidth(newWidth);
  };

  const toggleAdminPanel = () => {
    setShowAdminPanel(!showAdminPanel);
  };

  const rightPanelWidth = isMobile ? 100 : 100 - leftPanelWidth;

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header
        onOpenAdminPanel={toggleAdminPanel}
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Panel - Responsive width */}
        <div
          ref={editorContainerRef}
          className="w-full md:flex-1 bg-white p-4 md:p-6 overflow-y-auto flex flex-col relative pb-16 md:pb-4"
          style={{
            width: window.innerWidth >= 768 ? `${leftPanelWidth}%` : "100%",
          }}
        >
          <div className="flex-1 mt-4 relative">
            {mode === "edicion" && (
              <SermonEditor
                sermon={sermon}
                setSermon={setSermon}
                onClearSermon={handleClearSermon}
              />
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

      {mode === "estudio" && <SermonStudyView sermon={sermon} />}
      {mode === "predicacion" && <SermonPreachingView sermon={sermon} />}
      {showAdminPanel && esAdministrador(currentUser) && (
        <AdminPanel onClose={toggleAdminPanel} />
      )}
    </div>
  );
}

export default App;
