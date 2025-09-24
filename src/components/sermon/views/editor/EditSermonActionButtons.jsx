import SermonSaveButton from "./SermonSaveButton";
import { useAccessControl } from "@/hooks/useAccessControl";

export const ActionButtons = ({ 
  displayMode,
  onClearSermon,
  onSave,
  isSaving,
  lastSaved,
  isPopover = false 
}) => {
  const { hasAccess, getAccessMessage } = useAccessControl();
  
  const isCompact = displayMode === "collapsed";

  return (
    <div className={`flex ${isCompact ? "gap-2 flex-col w-full" : "gap-4 w-auto"} items-center relative md:py-5 overflow-auto`}>
      <button
        onClick={onClearSermon}
        className={`custom-btn justify-center w-full bg-transparent !text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-400`}
      >
        Limpiar
      </button>

      {hasAccess.saveSermon ? (
        <SermonSaveButton
          onSave={onSave}
          isSaving={isSaving}
          lastSaved={lastSaved}
          compact={isCompact && !isPopover}
        />
      ) : (
        <button
          onClick={() => alert(getAccessMessage("saveSermon"))}
          className={`custom-btn font-medium text-nowrap bg-gray-300 !text-gray-500 cursor-not-allowed border border-gray-300`}
          disabled
          title={getAccessMessage("saveSermon")}
        >
          {isCompact && !isPopover
            ? "🔒"
            : isPopover
            ? "🔒 Guardar (Bloqueado)"
            : "🔒 Guardar"}
        </button>
      )}
    </div>
  );
};
