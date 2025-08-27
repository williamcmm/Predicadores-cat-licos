import React, { useState, useEffect } from 'react';

const SermonIdea = ({ idea, onUpdate, onDelete, generateAlternative, sermonContext }) => {
  // Internal state for controlled components
  const [h1, setH1] = useState(idea.h1 || '');
  const [elementType, setElementType] = useState(idea.elementoApoyo?.tipo || 'cita_biblica');
  const [elementContent, setElementContent] = useState(idea.elementoApoyo?.contenido || '');
  const [disparadores, setDisparadores] = useState(idea.disparadores || []);
  const [isSuggesting, setIsSuggesting] = useState({ h1: false, parrafo: {} });

  // This effect synchronizes the component's internal state with the props from the parent.
  // This is crucial for when the sermon data is loaded asynchronously from the AI.
  useEffect(() => {
    setH1(idea.h1 || '');
    setElementType(idea.elementoApoyo?.tipo || 'cita_biblica');
    setElementContent(idea.elementoApoyo?.contenido || '');
    setDisparadores(idea.disparadores || []);
  }, [idea]); // Dependency array ensures this runs whenever the 'idea' prop changes

  const handleUpdate = (field, value) => {
    let updatedIdea = { ...idea };

    switch (field) {
      case 'h1':
        updatedIdea.h1 = value;
        break;
      case 'elementType':
        updatedIdea.elementoApoyo = { ...updatedIdea.elementoApoyo, tipo: value };
        break;
      case 'elementContent':
        updatedIdea.elementoApoyo = { ...updatedIdea.elementoApoyo, contenido: value };
        break;
      case 'disparadores':
        updatedIdea.disparadores = value;
        break;
      default:
        break;
    }
    onUpdate(updatedIdea);
  };

  const handleH1Change = (e) => {
    setH1(e.target.value);
    handleUpdate('h1', e.target.value);
  };

  const handleElementTypeChange = (e) => {
    setElementType(e.target.value);
    handleUpdate('elementType', e.target.value);
  };

  const handleElementContentChange = (e) => {
    setElementContent(e.target.value);
    handleUpdate('elementContent', e.target.value);
  };

  const handleDisparadorChange = (id, field, value) => {
    const updatedDisparadores = disparadores.map((d) =>
      d.id === id ? { ...d, [field]: value } : d
    );
    setDisparadores(updatedDisparadores);
    handleUpdate('disparadores', updatedDisparadores);
  };

  const handleSuggestIdeaAlternative = async (field, disparadorId = null) => {
    setIsSuggesting(prev => {
      if (field === 'parrafo') return { ...prev, parrafo: { ...prev.parrafo, [disparadorId]: true } };
      return { ...prev, [field]: true };
    });
    try {
      const alternative = await generateAlternative(sermonContext, field, idea.id, disparadorId);
      if (alternative) {
        if (field === 'h1') {
          setH1(alternative);
          handleUpdate('h1', alternative);
        } else if (field === 'parrafo') {
          const updatedDisparadores = disparadores.map(d => 
            d.id === disparadorId ? { ...d, parrafo: alternative } : d
          );
          setDisparadores(updatedDisparadores);
          handleUpdate('disparadores', updatedDisparadores);
        }
      }
    } catch (error) {
      console.error(`Error suggesting another for ${field}:`, error);
      alert(`Hubo un error al sugerir otra opción para ${field}.`);
    } finally {
      setIsSuggesting(prev => {
        if (field === 'parrafo') return { ...prev, parrafo: { ...prev.parrafo, [disparadorId]: false } };
        return { ...prev, [field]: false };
      });
    }
  };

  const addDisparador = () => {
    const newId = disparadores.length > 0 ? Math.max(...disparadores.map(d => d.id)) + 1 : Date.now();
    const newDisparadores = [...disparadores, { id: newId, disparador: '', parrafo: '' }];
    setDisparadores(newDisparadores);
    handleUpdate('disparadores', newDisparadores);
  };

  const deleteDisparador = (id) => {
    const updatedDisparadores = disparadores.filter((d) => d.id !== id);
    setDisparadores(updatedDisparadores);
    handleUpdate('disparadores', updatedDisparadores);
  };

  return (
    <div className="border p-4 mb-4 rounded-md bg-gray-50 relative">
      <button
        onClick={() => onDelete(idea.id)}
        className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold"
      >
        X
      </button>
      {/* NIVEL 1: H1 (Idea Central) */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-gray-700 text-sm font-semibold">
            Idea Central (H1)
          </label>
          <button onClick={() => handleSuggestIdeaAlternative('h1')} disabled={isSuggesting.h1} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50">
            {isSuggesting.h1 ? '...' : 'Sugerir Otro'}
          </button>
        </div>
        <input
          type="text"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Frase que refuerza directamente el título del sermón"
          value={h1}
          onChange={handleH1Change}
        />
      </div>

      {/* NIVEL 2: Elemento de Apoyo (Texto Base Sagrado) */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-semibold mb-2">
          Elemento de Apoyo
        </label>
        <select
          className="shadow border rounded w-full py-2 px-3 text-gray-700 mb-2 leading-tight focus:outline-none focus:shadow-outline"
          value={elementType}
          onChange={handleElementTypeChange}
        >
          <option value="cita_biblica">Cita Bíblica Completa</option>
          <option value="catecismo">Cita del Catecismo Completa</option>
          <option value="documento_pontificio">Documento Pontificio</option>
          <option value="ensenanza_iglesia">Enseñanza de la Iglesia</option>
          <option value="testimonio_doctrinal">Testimonio Doctrinal</option>
        </select>
        <textarea
          rows="5"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Texto completo que fundamenta la Idea Central (H1)"
          value={elementContent}
          onChange={handleElementContentChange}
        ></textarea>
      </div>

      {/* NIVEL 3: Sistema de Disparadores Mentales + Párrafos */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-semibold mb-2">
          Disparadores Mentales y Párrafos
        </label>
        {disparadores.map((disparador, index) => (
          <div key={disparador.id || index} className="border p-3 mb-3 rounded-md bg-white relative">
            <button
              onClick={() => deleteDisparador(disparador.id)}
              className="absolute top-1 right-1 text-red-400 hover:text-red-600 text-xs font-bold"
            >
              X
            </button>
            <div className="mb-2">
              <label className="block text-gray-600 text-xs font-medium mb-1">
                Disparador Mental
              </label>
              <input
                type="text"
                className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                placeholder="1-2 líneas máximo - frase que resume el párrafo de abajo"
                value={disparador.disparador}
                onChange={(e) => handleDisparadorChange(disparador.id, 'disparador', e.target.value)}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-gray-600 text-xs font-medium">
                  Párrafo Explicativo
                </label>
                <button onClick={() => handleSuggestIdeaAlternative('parrafo', disparador.id)} disabled={isSuggesting.parrafo[disparador.id]} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50">
                  {isSuggesting.parrafo[disparador.id] ? '...' : 'Sugerir Otro'}
                </button>
              </div>
              <textarea
                rows="6"
                className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                placeholder="Párrafo completo que desarrolla y explica el disparador mental"
                value={disparador.parrafo}
                onChange={(e) => handleDisparadorChange(disparador.id, 'parrafo', e.target.value)}
              ></textarea>
            </div>
          </div>
        ))}
        <button
          onClick={addDisparador}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
        >
          Añadir Disparador
        </button>
      </div>
    </div>
  );
};

export default SermonIdea;