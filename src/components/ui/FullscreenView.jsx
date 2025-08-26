
import React, { useState, useEffect, useRef } from 'react';
import { FiSettings, FiX } from 'react-icons/fi';

export default function FullscreenView({ children, onClose }) {
  const [fontSize, setFontSize] = useState(16);
  const [contentWidth, setContentWidth] = useState(80);
  const [showSettings, setShowSettings] = useState(false);
  const viewRef = useRef(null);

  useEffect(() => {
    const enterFullscreen = async () => {
      if (viewRef.current && viewRef.current.requestFullscreen) {
        try {
          await viewRef.current.requestFullscreen();
        } catch (err) {
          console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        }
      }
    };
    enterFullscreen();

    const handleFullscreenChange = () => {
      if (document.fullscreenElement === null) {
        onClose();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
  }, [onClose]);

  const handleClose = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      onClose();
    }
  };

  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { fontSize, contentWidth });
    }
    return child;
  });

  return (
    <div ref={viewRef} className="fixed inset-0 bg-white z-50 p-8 overflow-y-auto">
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-gray-600 hover:text-black z-50"
        aria-label="Cerrar vista"
      >
        <FiX size={28} />
      </button>

      <div className="w-full h-full">
        {childrenWithProps}
      </div>

      <div className="absolute bottom-4 right-4 z-50">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700"
          aria-label="Configuraciones"
        >
          <FiSettings size={24} />
        </button>

        {showSettings && (
          <div className="absolute bottom-16 right-0 bg-white border rounded-lg shadow-xl p-4 w-64">
            <div className="mb-4">
              <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700">
                Tamaño de Letra ({fontSize}px)
              </label>
              <input
                type="range"
                id="fontSize"
                min="12"
                max="32"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label htmlFor="contentWidth" className="block text-sm font-medium text-gray-700">
                Ancho de Columna ({contentWidth}%)
              </label>
              <input
                type="range"
                id="contentWidth"
                min="50"
                max="100"
                value={contentWidth}
                onChange={(e) => setContentWidth(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
