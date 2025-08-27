import React, { useState, useRef, useEffect } from 'react';
import { searchResourcesProgressive, generateGeneralSuggestions, generateSermon } from '../../services/ai/geminiService';

const INITIAL_CATEGORIES = [
  'DOCTRINA CATÓLICA',
  'CATECISMO',
  'SANTORAL CATÓLICO',
  'CITAS BÍBLICAS RELEVANTES',
  'REFLEXIONES SOBRE EL TEMA',
  'EJEMPLOS PRÁCTICOS',
  'TESTIMONIOS Y EXPERIENCIAS',
  'DATOS CIENTÍFICOS/HISTÓRICOS',
  'VIDEOS DE YOUTUBE',
  'REFERENCIAS DOCTRINALES',
  'DOCUMENTOS OFICIALES DE LA IGLESIA'
].map(name => ({ name, active: true }));

// Helper to initialize categories state
const initializeCategories = () => {
  const savedCategories = localStorage.getItem('resourceCategories');
  if (savedCategories) {
    try {
      const parsed = JSON.parse(savedCategories);
      // Ensure it's in the new format {name, active}
      if (Array.isArray(parsed) && parsed.every(c => typeof c === 'object' && 'name' in c && 'active' in c)) {
        return parsed;
      }
    } catch (e) {
      // Fallback if parsing fails
    }
  }
  return INITIAL_CATEGORIES;
};


export default function ResourcePanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [error, setError] = useState(null);
  const [userToggledCategories, setUserToggledCategories] = useState({}); // This state is for expanding/collapsing the resource list, not for activation
  const [generating, setGenerating] = useState(false);
  const [expandedResources, setExpandedResources] = useState({});
  const dropdownRef = useRef(null);
  const abortControllerRef = useRef(null);

  const [categories, setCategories] = useState(initializeCategories);

  useEffect(() => {
    localStorage.setItem('resourceCategories', JSON.stringify(categories));
  }, [categories]);

  const handleToggleCategoryActive = (categoryName) => {
    let newCategories = categories.map(c => 
      c.name === categoryName ? { ...c, active: !c.active } : c
    );
    // Sort to bring active categories to the top
    newCategories.sort((a, b) => b.active - a.active);
    setCategories(newCategories);
  };

  const handleMoveCategory = (index, direction) => {
    const newCategories = [...categories];
    const [movedCategory] = newCategories.splice(index, 1);
    newCategories.splice(index + direction, 0, movedCategory);
    setCategories(newCategories);
  };

  const shuffleArray = (arr) => {
    const a = Array.isArray(arr) ? [...arr] : [];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const mapCategory = (incoming) => {
    if (!incoming) return incoming;
    const up = (incoming || '').toUpperCase();
    const categoryNames = categories.map(c => c.name);
    for (const c of categoryNames) if (c === up) return c;
    for (const c of categoryNames) {
      const key = c.split(' ')[0];
      if (up.includes(key) || c.includes(up.split(' ')[0])) return c;
    }
    return incoming;
  };

  const getFoundForCategory = (catName) => {
    const list = searchResults || [];
    return list.find(c => {
      const resultCatName = (c.category || '').toUpperCase();
      if (!resultCatName) return false;
      if (resultCatName === catName) return true;
      const key = catName.split(' ')[0];
      if (resultCatName.includes(key)) return true;
      const catToken = resultCatName.split(' ')[0];
      if (catName.includes(catToken)) return true;
      return false;
    }) || null;
  };

  const handleToggleCategory = (cat) => {
    setUserToggledCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleSearch = async (termToSearch) => {
    if (isLoading) {
      return;
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const isSuggestionSearch = termToSearch.trim() === '';
    
    if (isSuggestionSearch) {
        setIsSuggesting(true);
    } else {
        setIsLoading(true);
    }

    setError(null);
    if (!isSuggestionSearch) {
        setSearchResults(null);
    }
    setSuggestions([]);
    setShowDropdown(false);
    setUserToggledCategories({});

    try {
      if (isSuggestionSearch) {
        const suggs = await generateGeneralSuggestions();
        const cleaned = (suggs || []).map(s => (s || '').replace(new RegExp('https?://(\S+)'), '').trim()).filter(Boolean);
        const shuffled = shuffleArray(cleaned).slice(0, 10);
        setSuggestions(shuffled);
        setShowDropdown(true);
      } else {
        setSearchResults([]); 
        const partial = [];
        const loadingState = {};
        const activeCategories = categories.filter(c => c.active).map(c => c.name);
        
        activeCategories.forEach(cName => { loadingState[cName] = true; });
        setCategoryLoading(loadingState);

        await searchResourcesProgressive(termToSearch, (categoryName, resources) => {
          const mapped = mapCategory(categoryName);
          const existingIndex = partial.findIndex(p => (p.category || '') === mapped);
          const entry = { category: mapped, resources };
          if (existingIndex === -1) partial.push(entry);
          else partial[existingIndex] = entry;
          setSearchResults([...partial]);
          setCategoryLoading(prev => ({ ...prev, [mapped]: false }));
        }, activeCategories, signal);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message ? err.message : String(err));
      }
    } finally {
      if (isSuggestionSearch) {
        setIsSuggesting(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  const handleStopSearch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
  };

  const handleClearSearch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setSearchTerm('');
    setSearchResults(null);
    setCategoryLoading({});
    setSuggestions([]);
    setShowDropdown(false);
    setIsLoading(false);
    setIsSuggesting(false);
    setError(null);
    setUserToggledCategories({});
    setGenerating(false);
    setExpandedResources({});
  };

  const onSuggestionClick = async (suggestion) => {
    const clean = (suggestion || '').replace(new RegExp('https?://(\S+)'), '').trim();
    setSearchTerm(clean);
    setShowDropdown(false);
    await handleSearch(clean);
  };

  const handleToggleReadMore = (rid) => setExpandedResources(prev => ({ ...prev, [rid]: !prev[rid] }));

  const handleGenerateSermon = async () => {
    if (!searchTerm && !searchResults) return;

    const activeCategoryNames = categories.filter(c => c.active).map(c => c.name);
    const filteredResults = (searchResults || []).filter(res => activeCategoryNames.includes(res.category));

    const isStillLoading = Object.values(categoryLoading).some(status => status === true);

    if (isStillLoading) {
      const confirmation = window.confirm(
        "La búsqueda de recursos aún no ha terminado.\n\nGeneraremos el sermón solo con los recursos encontrados hasta el momento (y de las categorías activas).\n\n¿Desea continuar y generar el sermón ahora, o esperar a que terminen de cargarse todos los recursos?"
      );
      if (!confirmation) {
        return;
      }
    }

    setGenerating(true);
    setError(null);
    try {
      const res = await generateSermon(searchTerm || '', filteredResults || {}, activeCategoryNames);
      if (res) {
        window.dispatchEvent(new CustomEvent('insertSermonIntoEditor', { detail: res }));
        try { localStorage.setItem('lastGeneratedSermon', JSON.stringify(res)); } catch (e) {
          console.error("Error guardando el sermón en localStorage", e);
        }
      }
    } catch (err) {
      console.error('generateSermon error', err);
      setError(err.message ? err.message : String(err));
    } finally {
      setGenerating(false);
    }
  };

  const hasResults = () => {
    if (!searchResults) return false;
    if (Array.isArray(searchResults)) return searchResults.some(c => Array.isArray(c.resources) && c.resources.length > 0);
    return false;
  };

  const renderInitialState = () => {
    if (isSuggesting) return <p className="text-gray-500">Buscando sugerencias...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;
    return null;
  };

  return (
    <div className="p-4 rounded-lg shadow-md h-full flex flex-col">
      <div className="flex mb-4 items-start">
        <div className="flex-1">
          <div className="flex">
            <input
              type="text"
              className="flex-1 shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Buscar temas y recursos para predicación"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
            />
            <button
              onClick={() => handleSearch(searchTerm)}
              className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600 transition-colors disabled:bg-blue-300"
              disabled={isLoading || isSuggesting}
            >
              {isLoading ? 'Buscando...' : (isSuggesting ? '...' : 'Buscar')}
            </button>
            <button
              onClick={handleClearSearch}
              className="ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              title="Limpiar tema y resultados"
            >
              Limpiar
            </button>
          </div>
          <div className="text-sm text-gray-600 mt-2">
            <p>Forma 1: Escribe un tema y haz clic en Buscar.</p>
            <p>Forma 2: Haz clic en Buscar (sin escribir nada) para obtener sugerencias.</p>
          </div>
        </div>
        {isLoading && (
          <button
            onClick={handleStopSearch}
            className="ml-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Detener Búsqueda
          </button>
        )}
      </div>

      <div className="flex-1 bg-white p-4 rounded-md overflow-y-auto relative">
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute top-0 left-0 right-0 w-full bg-white border rounded-md shadow-lg z-10" ref={dropdownRef}>
            <div className="p-2 border-b">
              <h3 className="text-md font-semibold">Sugerencias de Temas</h3>
            </div>
            <ul className="p-2">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  className="py-2 px-2 text-gray-700 cursor-pointer hover:bg-gray-100 rounded"
                  onClick={() => onSuggestionClick(s)}
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        <>
          {hasResults() && (
            <div className="mb-4 p-4 bg-green-50 border border-green-300 rounded">
              <div className="text-sm text-gray-700 font-medium">¿Cómo quieres continuar?</div>
              <div className="mt-3 flex gap-3">
                <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={handleGenerateSermon} disabled={generating}>
                  {generating ? 'Generando...' : 'Pedir a la IA que te sugiera un sermón'}
                </button>
                <button className="px-4 py-2 border border-green-500 text-green-700 rounded" onClick={() => {
                  window.dispatchEvent(new CustomEvent('startManualSermonFromResources', { detail: { topic: searchTerm } }));
                }}>
                  Crear el sermón tú mismo con los recursos proporcionados
                </button>
              </div>
            </div>
          )}

          <h3 className="text-md font-semibold mb-2">Categorías</h3>
          <p className="text-base font-semibold text-gray-700 mb-2">Activa o desactiva las categorías para tu búsqueda y sermón.</p>
          {searchResults === null && !isLoading && <div className="mb-4">{renderInitialState()}</div>}
          <div className="grid grid-cols-1 gap-2">
            {categories.map((cat, index) => {
              const found = searchResults ? getFoundForCategory(cat.name) : null;
              const count = found && found.resources ? found.resources.length : 0;
              const isExpanded = !!userToggledCategories[cat.name];
              const isLoadingCat = categoryLoading[cat.name] && (!searchResults || !found);

              return (
                <div key={cat.name} className={`border rounded p-2 transition-opacity ${!cat.active ? 'opacity-50' : ''}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                       <input 
                        type="checkbox"
                        checked={cat.active}
                        onChange={() => handleToggleCategoryActive(cat.name)}
                        className="mr-3 h-5 w-5"
                      />
                      <div className="flex flex-col mr-2">
                        <button 
                          onClick={() => handleMoveCategory(index, -1)} 
                          disabled={index === 0 || (!cat.active && categories[index - 1]?.active)} 
                          className="disabled:opacity-25"
                        >
                          ▲
                        </button>
                        <button 
                          onClick={() => handleMoveCategory(index, 1)} 
                          disabled={index === categories.length - 1 || (cat.active && !categories[index + 1]?.active)} 
                          className="disabled:opacity-25"
                        >
                          ▼
                        </button>
                      </div>
                      <div className="font-medium text-blue-600 hover:underline cursor-pointer" onClick={() => handleToggleCategory(cat.name)}>{cat.name}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-gray-600">({count})</div>
                      {isLoadingCat && <div className="text-sm text-yellow-600">Buscando...</div>}
                      {count > 0 && (
                          <button onClick={() => handleToggleCategory(cat.name)} className="text-blue-600 hover:underline text-sm">
                              {isExpanded ? 'Cerrar' : 'Abrir'}
                          </button>
                      )}
                    </div>
                  </div>
                  {isExpanded && cat.active && (
                    <div className="mt-2">
                      {count === 0 && <p className="text-sm text-gray-500">Sin resultados en esta categoría.</p>}
                      {count > 0 && (found.resources || []).map((resource, idx) => {
                        const rid = resource.id || `${cat.name}-${idx}`;
                        return (
                          <div key={rid} className="border-b pb-2 mb-2 last:border-b-0">
                            <p className="font-medium">{resource.title}</p>
                            <p className="text-sm text-gray-700">Fuente: {resource.source}</p>
                            <div className="text-sm text-gray-700">
                              {resource.excerpt ? (
                                <p className={expandedResources[rid] ? '' : 'line-clamp-3'}>{resource.excerpt}</p>
                              ) : (resource.content && resource.content.length > 0 ? (
                                <p className={expandedResources[rid] ? '' : 'line-clamp-3'}>{resource.content[0]}</p>
                              ) : (
                                <p className="text-sm text-gray-500">Sin excerpt disponible.</p>
                              ))}
                              {(resource.excerpt || (resource.content && resource.content[0])) && (
                                <button className="text-sm text-blue-600 mt-1" onClick={() => handleToggleReadMore(rid)}>{expandedResources[rid] ? 'Leer menos' : 'Leer más'}</button>
                              )}
                            </div>
                            {expandedResources[rid] && resource.content && resource.content.length > 1 && (
                              <div className="mt-2 space-y-3">
                                {resource.content.slice(1).map((p, pi) => (
                                  <p key={pi}>{p}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      </div>
    </div>
  );
}
