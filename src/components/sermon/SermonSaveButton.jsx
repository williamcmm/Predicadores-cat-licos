import { useState } from "react";
import { FaSave, FaSpinner, FaCheck, FaTimes } from "react-icons/fa";

const SermonSaveButton = ({
  onSave,
  isSaving,
  lastSaved,
  className = "",
  compact = false,
}) => {
  const [saveStatus, setSaveStatus] = useState(null);

  const handleSave = async () => {
    try {
      const result = await onSave();

      if (result && result.success) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        console.error(
          "❌ SermonSaveButton: Guardado falló con resultado:",
          result
        );
        setSaveStatus("error");
        setTimeout(() => setSaveStatus(null), 5000);
        // Mostrar el error específico si está disponible
        if (result && result.error) {
          console.error("❌ SermonSaveButton: Error específico:", result.error);
        }
      }
    } catch (error) {
      console.error("❌ SermonSaveButton: Excepción durante guardado:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 5000);
    }
  };

  const getButtonStyle = () => {
    if (isSaving) return "bg-yellow-500 cursor-not-allowed";
    if (saveStatus === "success") return "bg-green-600 hover:bg-green-700";
    if (saveStatus === "error") return "bg-red-500 hover:bg-red-600";
    return "bg-green-500 hover:bg-green-600";
  };

  const getButtonContent = () => {
    if (compact) {
      if (isSaving) return <FaSpinner className="animate-spin" />;
      if (saveStatus === "success") return <FaCheck />;
      if (saveStatus === "error") return <FaTimes />;
      return <FaSave />;
    }

    if (isSaving)
      return (
        <>
          <FaSpinner className="animate-spin mr-2 flex-shrink-0" />
          Guardando...
        </>
      );
    if (saveStatus === "success")
      return (
        <>
          <FaCheck className="mr-2 flex-shrink-0" />
          Guardado exitosamente
        </>
      );
    if (saveStatus === "error")
      return (
        <>
          <FaTimes className="mr-2 flex-shrink-0" />
          Error al guardar
        </>
      );
    return (
      <>
        <FaSave className="mr-2 flex-shrink-0" />
        Guardar Sermón
      </>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleSave}
        className={`custom-btn w-full ${className} ${getButtonStyle()}`}
        disabled={isSaving}
        title={compact ? (isSaving ? "Guardando..." : "Guardar") : ""}
      >
        {getButtonContent()}
      </button>
      {lastSaved && !compact && (
        <div className="text-gray-500 text-xs hidden sm:inline">
          Último guardado: {new Date(lastSaved).toLocaleTimeString()}
        </div>
      )}
      {saveStatus === "error" && !compact && (
        <div className="text-red-500 text-xs">
          Error al guardar. Intente nuevamente.
        </div>
      )}
    </div>
  );
};

export default SermonSaveButton;
