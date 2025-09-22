import { useState, useEffect } from "react";
import SermonDisparadores from "./SermonDisparadores";

export const SermonIdea = ({ idea, onUpdate, onDelete, index }) => {
  // Internal state for controlled components
  const [h1, setH1] = useState(idea.h1 || "");
  const [lineaInicial, setLineaInicial] = useState(idea.lineaInicial || "");
  const [elementType, setElementType] = useState(
    idea.elementoApoyo?.tipo || "cita_biblica"
  );
  const [elementContent, setElementContent] = useState(
    idea.elementoApoyo?.contenido || ""
  );
  const [disparadores, setDisparadores] = useState(idea.disparadores || []);
  const [ejemploPractico, setEjemploPractico] = useState(
    idea.ejemploPractico || ""
  );
  const [resultadoEsperado, setResultadoEsperado] = useState(
    idea.resultadoEsperado || ""
  );

  // Sync with parent component state
  useEffect(() => {
    setH1(idea.h1 || "");
    setLineaInicial(idea.lineaInicial || "");
    setElementType(idea.elementoApoyo?.tipo || "cita_biblica");
    setElementContent(idea.elementoApoyo?.contenido || "");
    setDisparadores(idea.disparadores || []);
    setEjemploPractico(idea.ejemploPractico || "");
    setResultadoEsperado(idea.resultadoEsperado || "");
  }, [idea]);

  // --- Event Handlers ---
  const handleUpdate = (field, value) => {
    const updatedIdea = { ...idea, [field]: value };
    onUpdate(updatedIdea);
  };

  const handleElementChange = (field, value) => {
    const updatedElementoApoyo = { ...idea.elementoApoyo, [field]: value };
    if (field === "tipo") setElementType(value);
    if (field === "contenido") setElementContent(value);
    handleUpdate("elementoApoyo", updatedElementoApoyo);
  };

  const handleDisparadoresChange = (updated) => {
    setDisparadores(updated);
    handleUpdate("disparadores", updated);
  };

  return (
    <div id={`idea-${idea.id}`} className="bg-white rounded-xl shadow-lg p-4 sm:p-8 border-l-4 border-blue-600 mb-8 overflow-auto">
      {/* Header con título de la idea */}
      <div className="flex flex-col flex-wrap sm:flex-row gap-2 justify-between sm:items-center mb-6 pb-4 border-b-2 border-gray-200">
        <div className="flex-1 mb-4 sm:mb-0">
          <label className="block font-bold text-gray-600 text-xs uppercase mb-2">
            IDEA PRINCIPAL #{index + 1}
          </label>
          <input
            id={`idea-${idea.id}-title`}
            type="text"
            value={h1}
            onChange={(e) => {
              setH1(e.target.value);
              handleUpdate("h1", e.target.value);
            }}
            placeholder="Una Nueva Mentalidad - El Conflicto como Invitación Divina"
            className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg font-semibold text-gray-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <button
          onClick={() => onDelete(idea.id)}
          className="bg-red-500 text-white border-none py-2 px-4 rounded-md cursor-pointer text-sm transition-colors hover:bg-red-600 self-end sm:self-center"
        >
          Eliminar Idea
        </button>
      </div>

      {/* Línea inicial destacada */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md mb-6">
        <label className="block font-semibold text-blue-800 text-sm mb-2">
          Línea Inicial Impactante
        </label>
        <textarea
          value={lineaInicial}
          onChange={(e) => {
            setLineaInicial(e.target.value);
            handleUpdate("lineaInicial", e.target.value);
          }}
          placeholder="Todo conflicto matrimonial es una invitación de Dios a crecer en santidad"
          className="w-full p-2 border border-blue-200 rounded-md resize-y text-sm bg-white"
          rows={2}
        />
      </div>

      {/* Fragmento Doctrinal */}
      <div className="mb-6 p-5 bg-gray-100 rounded-lg">
        <div className="mb-4">
          <label className="block font-semibold text-gray-700 mb-1">
            Tipo de Fragmento
          </label>
          <select
            value={elementType}
            onChange={(e) => handleElementChange("tipo", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm"
          >
            <option value="cita_biblica">Cita Bíblica</option>
            <option value="catecismo">Catecismo de la Iglesia Católica</option>
            <option value="reflexion">Reflexión Teológica Importante</option>
          </select>
        </div>
        <div>
          <textarea
            value={elementContent}
            onChange={(e) => handleElementChange("contenido", e.target.value)}
            placeholder='"Donde abunda el pecado, sobreabunda la gracia" (Romanos 5:20, DHH)'
            className="w-full p-3 border border-gray-300 rounded-md min-h-[80px] resize-y text-sm"
          ></textarea>
        </div>
      </div>

      {/* Sección de Disparadores Mentales */}
      <div className="mb-6">

        <SermonDisparadores
          disparadores={disparadores}
          onChange={handleDisparadoresChange}
        />
      </div>

      {/* Ejemplo Práctico */}
      <div className="bg-amber-100 border-l-4 border-amber-500 p-5 rounded-lg my-5">
        <div className="font-bold text-amber-800 mb-2 flex items-center gap-2">
          <span className="text-lg">💼</span>
          Ejemplo Práctico
        </div>
        <textarea
          value={ejemploPractico}
          onChange={(e) => {
            setEjemploPractico(e.target.value);
            handleUpdate("ejemploPractico", e.target.value);
          }}
          placeholder="Cuando discutan por el dinero, no vean solo el problema financiero..."
          className="w-full p-2 border-none rounded-md resize-y text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>

      {/* Resultado Esperado */}
      <div className="bg-emerald-100 border-l-4 border-emerald-500 p-5 rounded-lg my-5">
        <div className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
          <span className="text-lg">🎯</span>
          Resultado Esperado
        </div>
        <textarea
          value={resultadoEsperado}
          onChange={(e) => {
            setResultadoEsperado(e.target.value);
            handleUpdate("resultadoEsperado", e.target.value);
          }}
          placeholder="En lugar de salir lastimados del conflicto, salen fortalecidos..."
          className="w-full p-2 border-none rounded-md resize-y text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>
    </div>
  );
};


