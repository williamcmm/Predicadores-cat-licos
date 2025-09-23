import { useState, useRef, useEffect } from "react";
import {
  FaSync,
  FaPaste,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import {
  searchResourcesProgressive,
  generateGeneralSuggestions,
  generateSermon,
} from "@/services/ai/geminiService";
import {
  INITIAL_CATEGORIES,
  PERSONAL_RESOURCE_CATEGORY,
} from "@/constants/resources-categories";
import { AiGenerateButtons } from "./AiGenerateButtons";
import PersonalResourceModal from "./PersonalResourceModal";

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

  const dropdownRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("resourceCategories", JSON.stringify(categories));
  }, [categories]);

  const handleSavePastedText = (text) => {
    const personalResource = {
      title: "Texto Personal",
      source: "Aporte del usuario",
      content: [text],
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

  // When all categoryLoading entries become false (i.e. all categories finished),
  // make sure the global isLoading flag is cleared so the search button re-enables.
  useEffect(() => {
    const keys = Object.keys(categoryLoading || {});
    if (keys.length === 0) return;
    const anyLoading = keys.some((k) => categoryLoading[k] === true);
    if (!anyLoading) {
      setIsLoading(false);
      // clear controller since work finished
      if (abortControllerRef.current) {
        try {
          abortControllerRef.current = null;
        } catch (e) {
          // noop
        }
      }
    }
  }, [categoryLoading]);
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
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch (e) {
        console.error("Error aborting search controller", e);
      }
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setCategoryLoading({});
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

  const hasContent = () =>
    searchResults &&
    searchResults.some((c) => c.resources && c.resources.length > 0);

  return (
    <div className="p-4 rounded-lg shadow-md h-full flex flex-col">
      <PersonalResourceModal
        isOpen={isPastingModalOpen}
        onClose={() => setIsPastingModalOpen(false)}
        onSave={handleSavePastedText}
        generating={generating}
      />

      <div className="flex flex-col sm:flex-row mb-4 items-start sm:items-center">
        <div className="flex-1 w-full sm:w-auto">
          <div className="flex">
            <input
              type="text"
              className={`${
                generating ? "btn-disabled" : ""
              } flex-1 shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              placeholder="Buscar temas y recursos para predicación"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !generating && handleSearch(searchTerm)
              }
              disabled={generating}
            />
            <button
              onClick={() => !generating && handleSearch(searchTerm)}
              className="custom-btn bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 !rounded-l-none"
              disabled={isLoading || isSuggesting || generating}
            >
              {isLoading
                ? "Buscando..."
                : isSuggesting
                ? "..."
                : searchTerm === ""
                ? "Sugerir"
                : "Buscar"}
            </button>
            <button
              onClick={handleClearSearch}
              className={`${
                generating ? "btn-disabled" : ""
              } custom-btn bg-red-500 hover:bg-red-600 ml-2`}
              title="Limpiar tema y resultados"
              disabled={generating}
            >
              Limpiar
            </button>
          </div>
          <div
            className={`${
              generating ? "btn-disabled" : ""
            } text-sm text-gray-600 mt-2 flex flex-col gap-2`}
          >
            {isLoading && (
              <button
                onClick={handleStopSearch}
                className="custom-btn bg-red-500 hover:bg-red-600 self-start"
                disabled={generating}
              >
                Detener Búsqueda
              </button>
            )}
            <p>Forma 1: Escribe un tema y haz clic en Buscar.</p>
            <p>
              Forma 2: Haz clic en Buscar (sin escribir nada) para obtener
              sugerencias.
            </p>
          </div>
        </div>
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
          <AiGenerateButtons
            categories={categories}
            searchResults={searchResults}
            categoryLoading={categoryLoading}
            generateSermon={generateSermon}
            searchTerm={searchTerm}
            generating={generating}
            setGenerating={setGenerating}
          />
        )}

        <p className="text-base font-semibold text-gray-700 mb-2">
          Categorías de Búsqueda
        </p>

        <div className="grid grid-cols-1 gap-2">
          {categories.map((cat, index) => {
            const found = searchResults ? getFoundForCategory(cat.name) : null;
            const count =
              found || found?.resources ? found.resources.length : 0;
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
                  <div className="flex items-center mb-2 sm:mb-0 gap-2 md:gap-4">
                    <input
                      type="checkbox"
                      checked={cat.active}
                      onChange={() => handleToggleCategoryActive(cat.name)}
                      className={`${
                        generating ? "btn-disabled" : ""
                      } w-4 h-4 rounded text-blue-600 focus:ring-blue-500 flex-shrink-0`}
                      disabled={generating}
                    />
                    <div className="flex flex-col mr-2">
                      <button
                        onClick={() =>
                          !generating && handleMoveCategory(index, -1)
                        }
                        disabled={index === 0 || generating}
                        className="disabled:opacity-25 text-gray-600 hover:text-blue-600"
                      >
                        <FaChevronUp size={13} />
                      </button>
                      <button
                        onClick={() =>
                          !generating && handleMoveCategory(index, 1)
                        }
                        disabled={index === categories.length - 1 || generating}
                        className="disabled:opacity-25 text-gray-600 hover:text-blue-600"
                      >
                        <FaChevronDown size={13} />
                      </button>
                    </div>
                    <div
                      className="font-medium text-blue-600 hover:underline cursor-pointer"
                      onClick={() => handleToggleCategory(cat.name)}
                    >
                      {cat.name}
                    </div>
                    {isPersonalResource ? (
                      <button
                        onClick={() =>
                          !generating && setIsPastingModalOpen(true)
                        }
                        className={`${
                          generating || cat.active === false
                            ? "btn-disabled"
                            : ""
                        } mr-2 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center`}
                        disabled={generating || cat.active === false}
                      >
                        <FaPaste className="mr-2" />
                        Añadir Texto
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          !generating && handleFetchSingleCategory(cat.name)
                        }
                        disabled={isLoadingCat || !cat.active || generating}
                        className="p-1 mx-1 text-gray-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Buscar en esta categoría"
                      >
                        <FaSync
                          className={isLoadingCat ? "animate-spin" : ""}
                        />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 self-end sm:self-center">
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
