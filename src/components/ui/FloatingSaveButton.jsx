import { useState } from "react";
import { FaSave, FaSpinner, FaCheck, FaTimes } from "react-icons/fa";
import { useScrollViewStore } from "../../store/scroll-view-store";

export const FloatingSaveButton = ({ onSave, isSaving }) => {
  const [saveStatus, setSaveStatus] = useState(null);

  // Hook del scroll store para detectar cuando mostrar el botón flotante
  const scrollY = useScrollViewStore(state => state.scrollY);
  const vh = useScrollViewStore(state => state.vh);

  // Calcular si debe mostrar el botón flotante
  const isScrolledPastViewport = scrollY > vh;

  const handleSave = async () => {
    try {
      const result = await onSave();

      if (result && result.success) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        console.error("❌ FloatingSaveButton: Guardado falló con resultado:", result);
        setSaveStatus("error");
        setTimeout(() => setSaveStatus(null), 5000);
        if (result && result.error) {
          console.error("❌ FloatingSaveButton: Error específico:", result.error);
        }
      }
    } catch (error) {
      console.error("❌ FloatingSaveButton: Excepción durante guardado:", error);
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

  // Solo mostrar el botón si se ha scrolleado
  if (!isScrolledPastViewport) {
    return null;
  }

  return (
    <button
      onClick={handleSave}
      className={`sticky bottom-20 left-full p-3 rounded-full opacity-40 hover:opacity-100 z-40 transition-all duration-300 hover:scale-110 ${getButtonStyle()}`}
      disabled={isSaving}
      aria-label="Guardar sermón"
      title="Guardar sermón"
    >
      {isSaving ? (
        <FaSpinner className="animate-spin text-white" size={20} />
      ) : saveStatus === "success" ? (
        <FaCheck className="text-white" size={20} />
      ) : saveStatus === "error" ? (
        <FaTimes className="text-white" size={20} />
      ) : (
        <FaSave className="text-white" size={20} />
      )}
    </button>
  );
};