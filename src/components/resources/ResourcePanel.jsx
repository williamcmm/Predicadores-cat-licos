import { useState, useRef, useEffect } from "react";
import { FaSync, FaPaste, FaTimes, FaGripVertical } from "react-icons/fa";
import {
  searchResourcesProgressive,
  generateGeneralSuggestions,
  generateSermon,
} from "../../services/ai/geminiService";

const PERSONAL_RESOURCE_CATEGORY = "RECURSOS PERSONALES";

const INITIAL_CATEGORIES = [
  "DOCTRINA CATÓLICA",
  "CATECISMO",
  "SANTORAL CATÓLICO",
  "CITAS BÍBLICAS RELEVANTES",
  "REFLEXIONES SOBRE EL TEMA",
  "EJEMPLOS PRÁCTICOS",
  "TESTIMONIOS Y EXPERIENCIAS",
  "DATOS CIENTÍFICOS/HISTÓRICOS",
  "REFERENCIAS DOCTRINALES",
  "DOCUMENTOS OFICIALES DE LA IGLESIA",
  PERSONAL_RESOURCE_CATEGORY,
].map((name) => ({ name, active: false }));

const initializeCategories = () => {
  try {
    const savedCategories = localStorage.getItem("resourceCategories");
    if (savedCategories) {
      const parsed = JSON.parse(savedCategories);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].name) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Error reading categories from localStorage", error);
  }
  return INITIAL_CATEGORIES;
};

export default function ResourcePanel() {
  // Component States
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [userToggledCategories, setUserToggledCategories] = useState({});
  const [generating, setGenerating] = useState(false);
  const [expandedResources, setExpandedResources] = useState({});
  const [categories, setCategories] = useState(initializeCategories);
  const [isPastingModalOpen, setIsPastingModalOpen] = useState(false);
  const [pastedTextInput, setPastedTextInput] = useState("");

  const dropdownRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("resourceCategories", JSON.stringify(categories));
  }, [categories]);

  const handleSavePastedText = () => {
    const personalResource = {
      title: "Texto Personal",
      source: "Aporte del usuario",
      content: [pastedTextInput],
      id: `personal-resource-${Date.now()}`,
    };

    setSearchResults((prevResults) => {
      const newResults = prevResults ? [...prevResults] : [];
      const existingCategoryIndex = newResults.findIndex(
        (c) => c.category === PERSONAL_RESOURCE_CATEGORY
      );

      if (existingCategoryIndex > -1) {
        newResults[existingCategoryIndex].resources = [personalResource];
      } else {
        newResults.push({
          category: PERSONAL_RESOURCE_CATEGORY,
          resources: [personalResource],
        });
      }
      return newResults;
    });

    setPastedTextInput("");
    setIsPastingModalOpen(false);
  };

  const handleToggleCategoryActive = (categoryName) => {
    let newCategories = categories.map((c) =>
      c.name === categoryName ? { ...c, active: !c.active } : c
    );
    newCategories.sort((a, b) => b.active - a.active);
    setCategories(newCategories);
  };
  const handleMoveCategory = (index, direction) => {
    const newCategories = [...categories];
    const [movedCategory] = newCategories.splice(index, 1);
    newCategories.splice(index + direction, 0, movedCategory);
    setCategories(newCategories);
  };
  const onResourceUpdate = (catName, resources) => {
    const mapped = mapCategory(catName);
    setSearchResults((prevResults) => {
      const partial = prevResults ? [...prevResults] : [];
      const existingIndex = partial.findIndex(
        (p) => (p.category || "") === mapped
      );
      const entry = { category: mapped, resources };
      if (existingIndex === -1) {
        partial.push(entry);
      } else {
        partial[existingIndex] = entry;
      }
      return partial;
    });
    setCategoryLoading((prev) => ({ ...prev, [mapped]: false }));
  };
  const handleFetchSingleCategory = async (categoryName) => {
    if (categoryName === PERSONAL_RESOURCE_CATEGORY) {
      alert("Para añadir un recurso personal, usa el botón 'Añadir Texto'.");
      return;
    }
    if (!searchTerm.trim()) {
      alert("Por favor, escribe un tema en la barra de búsqueda principal.");
      return;
    }
    const singleCategorySignal = new AbortController().signal;
    setCategoryLoading((prev) => ({ ...prev, [categoryName]: true }));
    try {
      await searchResourcesProgressive(
        searchTerm,
        onResourceUpdate,
        [categoryName],
        singleCategorySignal
      );
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error(`Error fetching single category ${categoryName}:`, err);
        setCategoryLoading((prev) => ({ ...prev, [categoryName]: false }));
      }
    }
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const mapCategory = (incoming) => {
    if (!incoming) return incoming;
    const up = (incoming || "").toUpperCase();
    const categoryNames = categories.map((c) => c.name);
    for (const c of categoryNames) if (c === up) return c;
    for (const c of categoryNames) {
      const key = c.split(" ")[0];
      if (up.includes(key) || c.includes(up.split(" ")[0])) return c;
    }
    return incoming;
  };
  const getFoundForCategory = (catName) => {
    const list = searchResults || [];
    return (
      list.find((c) => {
        const resultCatName = (c.category || "").toUpperCase();
        if (!resultCatName) return false;
        if (resultCatName === catName) return true;
        const key = catName.split(" ")[0];
        if (resultCatName.includes(key)) return true;
        const catToken = resultCatName.split(" ")[0];
        if (catName.includes(catToken)) return true;
        return false;
      }) || null
    );
  };
  const handleToggleCategory = (cat) => {
    setUserToggledCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };
  const handleSearch = async (termToSearch) => {
    if (isLoading) return;
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    const isSuggestionSearch = termToSearch.trim() === "";
    if (isSuggestionSearch) setIsSuggesting(true);
    else setIsLoading(true);
    if (!isSuggestionSearch)
      setSearchResults((prev) =>
        (prev || []).filter((r) => r.category === PERSONAL_RESOURCE_CATEGORY)
      );
    setSuggestions([]);
    setShowDropdown(false);
    setUserToggledCategories({});
    try {
      if (isSuggestionSearch) {
        const suggs = await generateGeneralSuggestions();
        const cleaned = (suggs || [])
          .map((s) => (s || "").replace(/https?:\/\/\S+/g, "").trim())
          .filter(Boolean);
        const shuffled = shuffleArray(cleaned).slice(0, 10);
        setSuggestions(shuffled);
        setShowDropdown(true);
      } else {
        const activeCategories = categories
          .filter((c) => c.active && c.name !== PERSONAL_RESOURCE_CATEGORY)
          .map((c) => c.name);
        if (activeCategories.length === 0) {
          console.log("No hay categorías activas para buscar.");
          setIsLoading(false);
          return;
        }
        const loadingState = {};
        activeCategories.forEach((cName) => {
          loadingState[cName] = true;
        });
        setCategoryLoading(loadingState);
        await searchResourcesProgressive(
          termToSearch,
          onResourceUpdate,
          activeCategories,
          signal
        );
      }
    } catch (err) {
      if (err.name !== "AbortError") console.error("Error during search:", err);
    } finally {
      if (isSuggesting) setIsSuggesting(false);
      else setIsLoading(false);
    }
  };
  const handleStopSearch = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setIsLoading(false);
  };

  const handleClearSearch = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setSearchTerm("");
    setSearchResults(null);
    setCategoryLoading({});
    setSuggestions([]);
    setShowDropdown(false);
    setIsLoading(false);
    setIsSuggesting(false);
    setUserToggledCategories({});
    setGenerating(false);
    setExpandedResources({});
    setPastedTextInput("");
  };

  const onSuggestionClick = async (suggestion) => {
    const clean = (suggestion || "").replace(/https?:\/\/\S+/g, "").trim();
    setSearchTerm(clean);
    setShowDropdown(false);
    await handleSearch(clean);
  };
  const handleToggleReadMore = (rid) =>
    setExpandedResources((prev) => ({ ...prev, [rid]: !prev[rid] }));

  const handleGenerateSermon = async () => {
    const activeCategories = categories.filter((c) => c.active);
    const activeCategoryNames = activeCategories.map((c) => c.name);
    const filteredResults = (searchResults || []).filter((res) =>
      activeCategoryNames.includes(res.category)
    );

    if (
      !filteredResults ||
      filteredResults.length === 0 ||
      filteredResults.every((c) => !c.resources || c.resources.length === 0)
    ) {
      alert(
        "Por favor, activa y busca en algunas categorías, o añade un recurso personal antes de generar un sermón."
      );
      return;
    }

    const isStillLoading = Object.values(categoryLoading).some(
      (status) => status === true
    );
    if (isStillLoading) {
      const confirmation = window.confirm(
        "La búsqueda de recursos aún no ha terminado.\n\nGeneraremos el sermón solo con los recursos encontrados hasta el momento.\n\n¿Desea continuar?"
      );
      if (!confirmation) return;
    }

    setGenerating(true);
    try {
      const sermonData = await generateSermon(
        searchTerm || "Sermón basado en recursos",
        filteredResults
      );

      if (sermonData) {
        window.dispatchEvent(
          new CustomEvent("insertSermonIntoEditor", { detail: sermonData })
        );
        try {
          localStorage.setItem(
            "lastGeneratedSermon",
            JSON.stringify(sermonData)
          );
        } catch (e) {
          console.error("Error guardando el sermón en localStorage", e);
        }
      }
    } catch (err) {
      console.error("generateSermon error", err);
      alert(`Error al generar sermón: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const hasContent = () =>
    searchResults &&
    searchResults.some((c) => c.resources && c.resources.length > 0);

  return (
    <div className="p-4 rounded-lg shadow-md h-full flex flex-col">
      {isPastingModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Añadir Recurso Personal</h3>
              <button
                onClick={() => setIsPastingModalOpen(false)}
                className="text-2xl"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <textarea
                className="w-full h-full p-2 border rounded-md min-h-[300px]"
                placeholder="Copia y pega aquí tu texto. Este texto se tratará como un recurso más para la generación del sermón."
                value={pastedTextInput}
                onChange={(e) => setPastedTextInput(e.target.value)}
              ></textarea>
            </div>
            <div className="flex justify-end p-4 border-t space-x-4">
              <button
                onClick={() => setIsPastingModalOpen(false)}
                className="px-4 py-2 rounded-md bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePastedText}
                className="px-4 py-2 rounded-md bg-blue-500 text-white"
              >
                Usar este Texto
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row mb-4 items-start sm:items-center">
        <div className="flex-1 w-full sm:w-auto">
          <div className="flex">
            <input
              type="text"
              className="flex-1 shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Buscar temas y recursos para predicación"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(searchTerm)}
            />
            <button
              onClick={() => handleSearch(searchTerm)}
              className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600 transition-colors disabled:bg-blue-300"
              disabled={isLoading || isSuggesting}
            >
              {isLoading ? "Buscando..." : isSuggesting ? "..." : "Buscar"}
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
            <p>
              Forma 2: Haz clic en Buscar (sin escribir nada) para obtener
              sugerencias.
            </p>
          </div>
        </div>
        {isLoading && (
          <button
            onClick={handleStopSearch}
            className="mt-2 sm:mt-0 sm:ml-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Detener Búsqueda
          </button>
        )}
      </div>

      <div className="flex-1 bg-white p-4 rounded-md overflow-y-auto relative">
        {showDropdown && suggestions.length > 0 && (
          <div
            className="absolute top-0 left-0 right-0 w-full bg-white border rounded-md shadow-lg z-10"
            ref={dropdownRef}
          >
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

        {hasContent() && (
          <div className="mb-4 p-4 bg-green-50 border border-green-300 rounded">
            <div className="text-sm text-gray-700 font-medium">
              ¿Cómo quieres continuar?
            </div>
            <div className="mt-3 flex flex-col sm:flex-row gap-3">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded"
                onClick={handleGenerateSermon}
                disabled={generating}
              >
                {generating
                  ? "Generando..."
                  : "Pedir a la IA que te sugiera un sermón"}
              </button>
              <button
                className="px-4 py-2 border border-green-500 text-green-700 rounded"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("startManualSermonFromResources", {
                      detail: { topic: searchTerm },
                    })
                  )
                }
              >
                Crear el sermón tú mismo
              </button>
            </div>
          </div>
        )}

        <p className="text-base font-semibold text-gray-700 mb-2">
          Categorías de Búsqueda
        </p>

        <div className="grid grid-cols-1 gap-2">
          {categories.map((cat, index) => {
            const found = searchResults ? getFoundForCategory(cat.name) : null;
            const count = found || found?.resources ? found.resources.length : 0;
            const isExpanded = !!userToggledCategories[cat.name];
            const isLoadingCat = !!categoryLoading[cat.name];
            const isPersonalResource = cat.name === PERSONAL_RESOURCE_CATEGORY;

            return (
              <div
                key={cat.name}
                className={`border rounded p-3 transition-opacity overflow-auto ${
                  !cat.active ? "opacity-50" : "bg-gray-50"
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="flex items-center mb-2 sm:mb-0 gap-2">
                    <input
                      type="checkbox"
                      checked={cat.active}
                      onChange={() => handleToggleCategoryActive(cat.name)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 flex-shrink-0"
                    />
                    <div className="flex items-center text-gray-400 mr-3">
                      <FaGripVertical />
                    </div>
                    <div className="flex flex-col mr-2">
                      <button
                        onClick={() => handleMoveCategory(index, -1)}
                        disabled={index === 0}
                        className="disabled:opacity-25 text-gray-600 hover:text-blue-600"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleMoveCategory(index, 1)}
                        disabled={index === categories.length - 1}
                        className="disabled:opacity-25 text-gray-600 hover:text-blue-600"
                      >
                        ▼
                      </button>
                    </div>
                    <div
                      className="font-medium text-blue-600 hover:underline cursor-pointer"
                      onClick={() => handleToggleCategory(cat.name)}
                    >
                      {cat.name}
                    </div>
                    {isPersonalResource && (
                      <button
                        onClick={() => setIsPastingModalOpen(true)}
                        className="mr-2 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                      >
                        <FaPaste className="mr-2" />
                        Añadir Texto
                      </button>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    {!isPersonalResource && (
                      <button
                        onClick={() => handleFetchSingleCategory(cat.name)}
                        disabled={isLoadingCat || !cat.active}
                        className="p-1 mx-1 text-gray-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Buscar en esta categoría"
                      >
                        <FaSync
                          className={isLoadingCat ? "animate-spin" : ""}
                        />
                      </button>
                    )}
                    <div className="text-sm text-gray-600">({count})</div>
                    {isLoadingCat && (
                      <div className="text-sm text-yellow-600">Buscando...</div>
                    )}
                    {count > 0 && (
                      <button
                        onClick={() => handleToggleCategory(cat.name)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {isExpanded ? "Cerrar" : "Abrir"}
                      </button>
                    )}
                  </div>
                </div>
                {isExpanded && cat.active && (
                  <div className="mt-2 pl-8">
                    {count === 0 && (
                      <p className="text-sm text-gray-500">
                        {isPersonalResource
                          ? "Aún no has añadido un texto personal."
                          : "Sin resultados en esta categoría."}
                      </p>
                    )}
                    {count > 0 &&
                      (found.resources || []).map((resource, idx) => {
                        const rid = resource.id || `${cat.name}-${idx}`;
                        return (
                          <div
                            key={rid}
                            className="border-b pb-2 mb-2 last:border-b-0"
                          >
                            <p className="font-medium">{resource.title}</p>
                            <p className="text-sm text-gray-700">
                              Fuente: {resource.source}
                            </p>
                            <div className="text-sm text-gray-700">
                              {resource.excerpt ? (
                                <p
                                  className={
                                    expandedResources[rid] ? "" : "line-clamp-3"
                                  }
                                >
                                  {resource.excerpt}
                                </p>
                              ) : resource.content &&
                                resource.content.length > 0 ? (
                                <p
                                  className={
                                    expandedResources[rid] ? "" : "line-clamp-3"
                                  }
                                >
                                  {resource.content[0]}
                                </p>
                              ) : (
                                <p className="text-sm text-gray-500">
                                  Sin excerpt disponible.
                                </p>
                              )}
                              {(resource.excerpt ||
                                (resource.content && resource.content[0])) && (
                                <button
                                  className="text-sm text-blue-600 mt-1"
                                  onClick={() => handleToggleReadMore(rid)}
                                >
                                  {expandedResources[rid]
                                    ? "Leer menos"
                                    : "Leer más"}
                                </button>
                              )}
                            </div>
                            {expandedResources[rid] &&
                              resource.content &&
                              resource.content.length > 1 && (
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
      </div>
    </div>
  );
}
