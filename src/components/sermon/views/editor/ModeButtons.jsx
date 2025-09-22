import { useViewModeStore } from "@/store/view-mode-store";

export const ModeButtons = ({ isPopover = false, displayMode }) => {

    // store
    const { mode, setMode } = useViewModeStore();

    const modes = [
        { id: "edicion", name: "Modo Edición", shortName: "Edición" },
        { id: "estudio", name: "Modo Estudio", shortName: "Estudio" },
        { id: "predicacion", name: "Modo Predicación", shortName: "Predicación" },
      ];

    const containerClass = isPopover 
      ? "flex flex-col items-center gap-2 w-full" 
      : "items-center border border-gray-200 rounded-lg p-1 flex";
    
    const buttonClass = isPopover
      ? "w-full px-3 py-2 rounded-md text-sm font-semibold transition-all duration-200 text-center"
      : "px-3 py-2 rounded-md text-sm font-semibold transition-all duration-200 text-left";

    return (
      <div className={containerClass}>
        {modes.map((m) => (
          <button
            key={m.id}
            className={`${buttonClass} ${
              mode === m.id
                ? "bg-blue-600 text-white shadow-md"
                : "bg-transparent text-gray-600 hover:bg-blue-50 hover:text-blue-700"
            }`}
            onClick={() => setMode(m.id)}
          >
            {isPopover || displayMode === "wide" ? m.name : m.shortName}
          </button>
        ))}
      </div>
    );
  };