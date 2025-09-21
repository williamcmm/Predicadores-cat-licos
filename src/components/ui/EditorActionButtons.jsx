import { useState, useEffect, useRef, Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import { FaBars } from "react-icons/fa";
import { ActionButtons } from "./EditSermonActionButtons";

export const EditorActionButtons = ({
  modo,
  setModo,
  onClearSermon,
  onSave,
  isSaving,
  lastSaved,
}) => {
  const [displayMode, setDisplayMode] = useState("wide"); // wide, narrow, collapsed
  const sidebarRef = useRef(null);

  const modes = [
    { id: "edicion", name: "Modo Edición", shortName: "Edición" },
    { id: "estudio", name: "Modo Estudio", shortName: "Estudio" },
    { id: "predicacion", name: "Modo Predicación", shortName: "Predicación" },
  ];

  useEffect(() => {
    const element = sidebarRef.current;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        if (width < 420) {
          setDisplayMode("collapsed");
        } else if (width < 580) {
          setDisplayMode("narrow");
        } else {
          setDisplayMode("wide");
        }
      }
    });

    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  // Componente para botones de modo
  const ModeButtons = ({ isPopover = false }) => {
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
              modo === m.id
                ? "bg-blue-600 text-white shadow-md"
                : "bg-transparent text-gray-600 hover:bg-blue-50 hover:text-blue-700"
            }`}
            onClick={() => setModo(m.id)}
          >
            {isPopover || displayMode === "wide" ? m.name : m.shortName}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div
      ref={sidebarRef}
      className="flex justify-between items-center p-3 border-b bg-white rounded-md shadow  gap-4"
    >
      {displayMode === "collapsed" ? (
        <Popover className="relative">
          <Popover.Button className="p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <FaBars className="h-5 w-5" />
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute z-10 mt-2 w-52 bg-white shadow-lg rounded-lg ring-1 ring-black ring-opacity-5">
              <div className="p-2 flex flex-col items-center gap-2">
                <ModeButtons isPopover />
                <ActionButtons 
                  displayMode={displayMode}
                  onClearSermon={onClearSermon}
                  onSave={onSave}
                  isSaving={isSaving}
                  lastSaved={lastSaved}
                  isPopover={true}
                />
              </div>
            </Popover.Panel>
          </Transition>
        </Popover>
      ) : (
        <div className="flex flex-nowrap justify-between items-center gap-4 w-full overflow-hidden">
          <ModeButtons />
          <ActionButtons 
            displayMode={displayMode}
            onClearSermon={onClearSermon}
            onSave={onSave}
            isSaving={isSaving}
            lastSaved={lastSaved}
            isPopover={false}
          />
        </div>
      )}
    </div>
  );
};
