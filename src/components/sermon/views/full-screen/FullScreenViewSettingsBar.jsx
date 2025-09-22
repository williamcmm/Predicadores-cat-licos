import { useState } from "react";
import { IoSettings } from "react-icons/io5";
import SermonExportButton from "../../SermonExportButton";

export const FullScreenViewSettingsBar = ({
  fontSize,
  setFontSize,
  contentWidth,
  setContentWidth,
  sermon,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-100 p-4 border-t border-gray-300 z-10 flex justify-end items-center space-x-4">
      <SermonExportButton sermon={sermon} />

      <button
        onClick={() => setShowSettings(!showSettings)}
        className="bg-blue-500 hover:bg-blue-700 rounded-full p-3 text-white shadow flex items-center justify-center text-2xl transition-all"
        aria-label="Configuración de vista"
      >
        <IoSettings size={20} />
      </button>
      {showSettings && (
        <div className="absolute bottom-20 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-full sm:w-64 left-4 sm:left-auto">
          <div className="mb-4">
            <label
              htmlFor="fontSizeSliderPred"
              className="block text-sm font-medium text-gray-700"
            >
              Tamaño de Letra: {fontSize.toFixed(1)}em
            </label>
            <input
              id="fontSizeSliderPred"
              type="range"
              min="1.0"
              max="2.5"
              step="0.1"
              value={fontSize}
              onChange={(e) => setFontSize(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label
              htmlFor="contentWidthSliderPred"
              className="block text-sm font-medium text-gray-700"
            >
              Ancho de Contenido: {contentWidth}%
            </label>
            <input
              id="contentWidthSliderPred"
              type="range"
              min="60"
              max="100"
              step="1"
              value={contentWidth}
              onChange={(e) => setContentWidth(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
