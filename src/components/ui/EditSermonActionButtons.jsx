import SermonSaveButton from "../sermon/SermonSaveButton";
import { useAccessControl } from "../../hooks/useAccessControl";

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
  const baseButtonClass = isPopover
    ? "px-4 py-2 rounded-md text-sm transition-all w-full"
    : isCompact
    ? "px-2 py-1 text-xs transition-all"
    : "px-4 py-2 rounded-md text-sm transition-all";

  const containerClass = isPopover
    ? "flex flex-col items-center gap-2 w-full pt-4 border-t"
    : isCompact
    ? "flex items-center gap-1"
    : "flex items-center gap-2 sm:gap-4";

  return (
    <div className={containerClass}>
      <button
        onClick={onClearSermon}
        className={`${baseButtonClass} font-medium bg-transparent text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-400`}
      >
        {isCompact && !isPopover ? "X" : "Limpiar"}
      </button>

      {hasAccess.saveSermon ? (
        <SermonSaveButton
          onSave={onSave}
          isSaving={isSaving}
          lastSaved={lastSaved}
          className={`${baseButtonClass} border border-transparent`}
          compact={isCompact && !isPopover}
        />
      ) : (
        <button
          onClick={() => alert(getAccessMessage("saveSermon"))}
          className={`${baseButtonClass} font-medium bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-300`}
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
