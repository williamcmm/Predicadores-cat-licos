import React from "react";

export const AiGenerateButtons = ({
  categories,
  searchResults,
  categoryLoading,
  generateSermon,
  searchTerm,
  generating,
  setGenerating,
}) => {
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
      if (typeof setGenerating === "function") setGenerating(false);
    }
  };
  return (
    <div className="mb-4 p-4 bg-green-50 border border-green-300 rounded">
      <div className="text-sm text-gray-700 font-medium">
        ¿Cómo quieres continuar?
      </div>
      <div className="mt-3 flex flex-col sm:flex-row gap-3">
        <button
          className={`${generating ? "btn-disabled" : ""} custom-btn bg-green-500 hover:bg-green-600`}
          onClick={handleGenerateSermon}
          disabled={generating}
        >
          {generating
            ? "Generando..."
            : "Pedir a la IA que te sugiera un sermón"}
        </button>
        <button
          className={`${generating ? "btn-disabled" : ""} custom-btn border border-green-500 !text-green-700 hover:bg-green-100`}
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent("startManualSermonFromResources", {
                detail: { topic: searchTerm },
              })
            )
          }
          disabled={generating}
        >
          Crear el sermón tú mismo
        </button>
      </div>
    </div>
  );
};

export default AiGenerateButtons;
