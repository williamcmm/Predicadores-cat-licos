import { useState } from "react";
import { generateDisparador } from "@/services/ai/geminiService";
import { FaXmark, FaPlus } from "react-icons/fa6";
import { getEmptyDisparador, getEmptyElementoApoyo, SERMON_LIMITS } from "@/models/sermonModel";
import ElementosApoyo from "./ElementosApoyo";

export default function SermonDisparadores({ disparadores = [], onChange }) {
  const [isGenerating, setIsGenerating] = useState({});

  const handleDisparadorChange = (id, field, value) => {
    const updated = disparadores.map((d) => (d.id === id ? { ...d, [field]: value } : d));
    onChange(updated);
  };

  const handleElementoApoyoChange = (disparadorId, elementoId, field, value) => {
    const updated = disparadores.map((d) => {
      if (d.id === disparadorId) {
        const updatedElementos = d.elementosApoyo.map((e) => (e.id === elementoId ? { ...e, [field]: value } : e));
        return { ...d, elementosApoyo: updatedElementos };
      }
      return d;
    });
    onChange(updated);
  };

  const addElementoApoyo = (disparadorId) => {
    const disparador = disparadores.find((d) => d.id === disparadorId);
    if (disparador && disparador.elementosApoyo.length >= 3) {
      alert("Máximo 3 elementos de apoyo por disparador");
      return;
    }
    const newElemento = getEmptyElementoApoyo();
    const updated = disparadores.map((d) => (d.id === disparadorId ? { ...d, elementosApoyo: [...d.elementosApoyo, newElemento] } : d));
    onChange(updated);
  };

  const deleteElementoApoyo = (disparadorId, elementoId) => {
    const updated = disparadores.map((d) => {
      if (d.id === disparadorId) {
        const updatedElementos = d.elementosApoyo.filter((e) => e.id !== elementoId);
        return { ...d, elementosApoyo: updatedElementos };
      }
      return d;
    });
    onChange(updated);
  };

  const addDisparador = () => {
    if (disparadores.length >= SERMON_LIMITS.MAX_DISPARADORES_POR_IDEA) {
      alert(`Máximo ${SERMON_LIMITS.MAX_DISPARADORES_POR_IDEA} disparadores por idea`);
      return;
    }
    const newDisparador = getEmptyDisparador();
    onChange([...disparadores, newDisparador]);
  };

  const deleteDisparador = (id) => {
    if (disparadores.length <= SERMON_LIMITS.MIN_DISPARADORES_POR_IDEA) {
      alert(`Debe mantener al menos ${SERMON_LIMITS.MIN_DISPARADORES_POR_IDEA} disparador en cada idea`);
      return;
    }
    onChange(disparadores.filter((d) => d.id !== id));
  };

  const handleGenerateDisparador = async (id) => {
    const disparador = disparadores.find((d) => d.id === id);
    if (!disparador || !disparador.parrafo.trim()) {
      alert("Primero escriba el contenido del párrafo para generar el disparador");
      return;
    }
    setIsGenerating((prev) => ({ ...prev, [id]: true }));
    try {
      const suggestion = await generateDisparador(disparador.parrafo);
      handleDisparadorChange(id, "disparador", suggestion.trim());
    } catch (error) {
      console.error("Error generating disparador:", error);
      alert("Hubo un error al generar el disparador.");
    } finally {
      setIsGenerating((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="mb-6">
      <div className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-3">
        <span className="text-xl">💡</span>
        Disparadores Mentales Clave
      </div>

      {disparadores.map((disparador, d_index) => (
        <div key={disparador.id} className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-4 relative overflow-auto">
          <button
            onClick={() => deleteDisparador(disparador.id)}
            className="absolute top-2 right-3 bg-red-500 text-white border-none w-7 h-7 rounded-full cursor-pointer text-lg font-bold flex items-center justify-center transition-colors hover:bg-red-600 z-10"
          >
            <FaXmark size={15} />
          </button>
          <div className="bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm absolute top-2 left-2">
            {d_index + 1}
          </div>
          <div className="ml-5 pt-3">
            <div className="mb-4">
              <label className="block font-semibold text-gray-500 mb-1 text-xs">Disparador Mental</label>
              <div className="flex flex-col flex-wrap sm:flex-row gap-2 items-stretch sm:items-center">
                <input
                  type="text"
                  value={disparador.disparador}
                  onChange={(e) => handleDisparadorChange(disparador.id, "disparador", e.target.value)}
                  placeholder="Frase corta que ayuda a recordar el párrafo"
                  className="flex-1 max-w-full p-2 border border-gray-300 rounded-md font-semibold text-gray-800 bg-white"
                />
                <button
                  onClick={() => handleGenerateDisparador(disparador.id)}
                  className="bg-teal-500 text-white border-none py-2 px-4 rounded-md cursor-pointer text-xs font-semibold whitespace-nowrap transition-colors hover:bg-teal-600 disabled:bg-gray-400"
                  disabled={isGenerating[disparador.id]}
                >
                  {isGenerating[disparador.id] ? "..." : "Generar"}
                </button>
              </div>
            </div>
            <div className="mb-4">
              <textarea
                value={disparador.parrafo}
                onChange={(e) => handleDisparadorChange(disparador.id, "parrafo", e.target.value)}
                placeholder="Introduzca aquí un párrafo que desea recordar con el disparador mental"
                className="w-full p-3 border border-gray-300 rounded-md min-h-[100px] resize-y text-sm"
              ></textarea>
            </div>

            <ElementosApoyo
              elementos={disparador.elementosApoyo}
              onElementoChange={(elementoId, field, value) => handleElementoApoyoChange(disparador.id, elementoId, field, value)}
              onDeleteElemento={(elementoId) => deleteElementoApoyo(disparador.id, elementoId)}
            />

            {(!disparador.elementosApoyo || disparador.elementosApoyo.length < 3) && (
              <button
                onClick={() => addElementoApoyo(disparador.id)}
                className="bg-gray-300 text-gray-700 border-none py-2 px-3 rounded text-xs font-medium transition-colors hover:bg-gray-400 flex items-center gap-1"
              >
                <FaPlus size={10} />
                Elemento de Apoyo
              </button>
            )}
          </div>
        </div>
      ))}

      <button
        onClick={addDisparador}
        className="bg-blue-500 text-white border-none py-3 px-5 rounded-md cursor-pointer font-semibold w-full mt-3 transition-colors hover:bg-blue-600"
      >
        + Añadir Nuevo Disparador
      </button>
    </div>
  );
}
