import { useState, useEffect } from "react";
import { generateDisparador } from "../../services/ai/geminiService";
import { FaXmark, FaPlus, FaBook } from "react-icons/fa6";
import { getEmptyDisparador, getEmptyElementoApoyo, SERMON_LIMITS } from "../../models/sermonModel";

const SermonIdea = ({ idea, onUpdate, onDelete, index }) => {
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
  const [isGenerating, setIsGenerating] = useState({});

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

  const handleDisparadorChange = (id, field, value) => {
    const updatedDisparadores = disparadores.map((d) =>
      d.id === id ? { ...d, [field]: value } : d
    );
    setDisparadores(updatedDisparadores);
    handleUpdate("disparadores", updatedDisparadores);
  };

  const handleElementoApoyoChange = (disparadorId, elementoId, field, value) => {
    const updatedDisparadores = disparadores.map((d) => {
      if (d.id === disparadorId) {
        const updatedElementos = d.elementosApoyo.map((e) =>
          e.id === elementoId ? { ...e, [field]: value } : e
        );
        return { ...d, elementosApoyo: updatedElementos };
      }
      return d;
    });
    setDisparadores(updatedDisparadores);
    handleUpdate("disparadores", updatedDisparadores);
  };

  const addElementoApoyo = (disparadorId) => {
    const disparador = disparadores.find(d => d.id === disparadorId);
    if (disparador && disparador.elementosApoyo.length >= 3) {
      alert("Máximo 3 elementos de apoyo por disparador");
      return;
    }
    
    const newElemento = getEmptyElementoApoyo();
    const updatedDisparadores = disparadores.map((d) =>
      d.id === disparadorId 
        ? { ...d, elementosApoyo: [...d.elementosApoyo, newElemento] }
        : d
    );
    setDisparadores(updatedDisparadores);
    handleUpdate("disparadores", updatedDisparadores);
  };

  const deleteElementoApoyo = (disparadorId, elementoId) => {
    const updatedDisparadores = disparadores.map((d) => {
      if (d.id === disparadorId) {
        const updatedElementos = d.elementosApoyo.filter((e) => e.id !== elementoId);
        return { ...d, elementosApoyo: updatedElementos };
      }
      return d;
    });
    setDisparadores(updatedDisparadores);
    handleUpdate("disparadores", updatedDisparadores);
  };

  const addDisparador = () => {
    if (disparadores.length >= SERMON_LIMITS.MAX_DISPARADORES_POR_IDEA) {
      alert(`Máximo ${SERMON_LIMITS.MAX_DISPARADORES_POR_IDEA} disparadores por idea`);
      return;
    }
    const newDisparador = getEmptyDisparador();
    const newDisparadores = [...disparadores, newDisparador];
    setDisparadores(newDisparadores);
    handleUpdate("disparadores", newDisparadores);
  };

  const deleteDisparador = (id) => {
    if (disparadores.length <= SERMON_LIMITS.MIN_DISPARADORES_POR_IDEA) {
      alert(`Debe mantener al menos ${SERMON_LIMITS.MIN_DISPARADORES_POR_IDEA} disparador en cada idea`);
      return;
    }
    const updatedDisparadores = disparadores.filter((d) => d.id !== id);
    setDisparadores(updatedDisparadores);
    handleUpdate("disparadores", updatedDisparadores);
  };

  const handleGenerateDisparador = async (id) => {
    const disparador = disparadores.find((d) => d.id === id);
    if (!disparador || !disparador.parrafo.trim()) {
      alert(
        "Primero escriba el contenido del párrafo para generar el disparador"
      );
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
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 border-l-4 border-blue-600 mb-8">
      {/* Header con título de la idea */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 pb-4 border-b-2 border-gray-200">
        <div className="flex-1 mb-4 sm:mb-0">
          <label className="block font-bold text-gray-600 text-xs uppercase mb-2">
            IDEA PRINCIPAL #{index + 1}
          </label>
          <input
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
          className="bg-red-500 text-white border-none py-2 px-4 rounded-md cursor-pointer text-sm sm:ml-4 transition-colors hover:bg-red-600 self-end sm:self-center"
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
        <div className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-3">
          <span className="text-xl">💡</span>
          Disparadores Mentales Clave
        </div>

        {disparadores.map((disparador, d_index) => (
          <div
            key={disparador.id}
            className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-4 relative"
          >
            <button
              onClick={() => deleteDisparador(disparador.id)}
              className="absolute top-2 right-3 bg-red-500 text-white border-none w-7 h-7 rounded-full cursor-pointer text-lg font-bold flex items-center justify-center transition-colors hover:bg-red-600 z-10"
            >
              <FaXmark size={15}/>
            </button>
            <div className="bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm absolute -top-2 left-4">
              {d_index + 1}
            </div>
            <div className="ml-5 pt-3">
              <div className="mb-4">
                <label className="block font-semibold text-gray-500 mb-1 text-xs">
                  Disparador Mental
                </label>
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <input
                    type="text"
                    value={disparador.disparador}
                    onChange={(e) =>
                      handleDisparadorChange(
                        disparador.id,
                        "disparador",
                        e.target.value
                      )
                    }
                    placeholder="Frase corta que ayuda a recordar el párrafo"
                    className="flex-1 p-2 border border-gray-300 rounded-md font-semibold text-gray-800 bg-white"
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
                  onChange={(e) =>
                    handleDisparadorChange(
                      disparador.id,
                      "parrafo",
                      e.target.value
                    )
                  }
                  placeholder="Introduzca aquí un párrafo que desea recordar con el disparador mental"
                  className="w-full p-3 border border-gray-300 rounded-md min-h-[100px] resize-y text-sm"
                ></textarea>
              </div>

              {/* Elementos de Apoyo del Disparador */}
              {disparador.elementosApoyo && disparador.elementosApoyo.length > 0 && (
                <div className="bg-white rounded-md border border-gray-200 p-4 mb-3">
                  <h5 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                    <span className="text-blue-500"><FaBook /></span>
                    Elementos de Apoyo ({disparador.elementosApoyo.length}/3)
                  </h5>
                  {disparador.elementosApoyo.map((elemento, e_index) => (
                    <div key={elemento.id} className="bg-gray-50 rounded-md p-3 mb-3 relative">
                      <button
                        onClick={() => deleteElementoApoyo(disparador.id, elemento.id)}
                        className="absolute top-2 right-2 bg-red-400 text-white border-none w-5 h-5 rounded-full cursor-pointer text-xs flex items-center justify-center transition-colors hover:bg-red-500"
                      >
                        <FaXmark size={10}/>
                      </button>
                      <div className="pr-8">
                        <div className="mb-2">
                          <select
                            value={elemento.tipo}
                            onChange={(e) => handleElementoApoyoChange(disparador.id, elemento.id, "tipo", e.target.value)}
                            className="w-full p-1.5 border border-gray-300 rounded text-xs bg-white"
                          >
                            <option value="cita_biblica">Cita Bíblica</option>
                            <option value="catecismo">Catecismo CIC</option>
                            <option value="reflexion">Reflexión</option>
                          </select>
                        </div>
                        <textarea
                          value={elemento.contenido}
                          onChange={(e) => handleElementoApoyoChange(disparador.id, elemento.id, "contenido", e.target.value)}
                          placeholder="Contenido del elemento de apoyo..."
                          className="w-full p-2 border border-gray-300 rounded text-xs resize-y"
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Botón para agregar elemento de apoyo */}
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

export default SermonIdea;
