import { useState, useEffect, useRef } from 'react';
import SermonExportButton from '../SermonExportButton';
import { IoSettings, IoClose } from "react-icons/io5";
import { MdFlashOn, MdWork, MdGpsFixed } from "react-icons/md";
import { FaBook } from 'react-icons/fa';

const SermonStudyView = ({ sermon, onClose, user }) => {
  const [fontSize, setFontSize] = useState(2.0);
  const [contentWidth, setContentWidth] = useState(80);
  const [showSettings, setShowSettings] = useState(false);
  const viewRef = useRef(null);

  useEffect(() => {
    const savedFontSize = localStorage.getItem('studyViewFontSize');
    const savedContentWidth = localStorage.getItem('studyViewContentWidth');
    if (savedFontSize) {
      setFontSize(parseFloat(savedFontSize));
    } else {
      setFontSize(2.0); // Set default if nothing is saved
    }
    if (savedContentWidth) setContentWidth(parseInt(savedContentWidth, 10));

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

  useEffect(() => {
    localStorage.setItem('studyViewFontSize', fontSize);
    localStorage.setItem('studyViewContentWidth', contentWidth);
  }, [fontSize, contentWidth]);

  const handleClose = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      onClose();
    }
  };

  if (!sermon) {
    return (
      <div ref={viewRef} className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <p className="text-center text-gray-500">No hay sermón para mostrar.</p>
        <button onClick={handleClose} className="absolute top-4 right-4 text-2xl">&times;</button>
      </div>
    );
  }

  return (
    <div ref={viewRef} className={`fixed inset-0 bg-white z-50 flex flex-col ${!user ? 'no-copy' : ''}`}>
      <button
        onClick={handleClose}
        className="fixed top-4 right-4 bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl z-20"
        aria-label="Cerrar vista de estudio"
      >
        <IoClose />
      </button>

      <div className="overflow-y-auto flex-grow pt-16 pb-28">
        <div
          className="sermon-study-view mx-auto font-serif text-gray-800 transition-all duration-300"
          style={{ maxWidth: `${contentWidth}%`, fontSize: `${fontSize}em` }}
        >
          <h1 className="font-bold mb-8 text-center text-gray-900 text-5xl">{sermon.title}</h1>

          <div className="mb-10 pb-6 border-b border-gray-200">
            <h2 className="font-semibold mb-4 text-gray-800 border-l-4 border-blue-500 pl-4 text-4xl">Introducción</h2>
            <div className="ml-5 leading-relaxed space-y-4">
              <p><strong>Presentación:</strong> <span className="whitespace-pre-line">{sermon.introduction?.presentation}</span></p>
              <p><strong>Motivación:</strong> <span className="whitespace-pre-line">{sermon.introduction?.motivation}</span></p>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="font-semibold mb-6 text-gray-800 border-l-4 border-blue-500 pl-4 text-4xl">Ideas Principales</h2>
            <div className="space-y-12">
              {sermon.ideas?.map((idea, index) => (
                <div key={idea.id || index} className="p-6 border border-gray-200 rounded-lg shadow-sm">
                  <h3 className="font-bold mb-4 text-blue-800 text-3xl">{`Idea ${index + 1}: ${idea.h1}`}</h3>
                  
                  {/* Línea Inicial Impactante */}
                  {idea.lineaInicial && (
                    <div className="mb-6 p-4 bg-purple-50 border-l-4 border-purple-500 rounded-r-lg">
                      <div className="flex items-center mb-2">
                        <MdFlashOn className="text-lg mr-2 text-purple-600" />
                        <p className="font-semibold text-purple-800">Línea Inicial Impactante</p>
                      </div>
                      <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                        {idea.lineaInicial}
                      </p>
                    </div>
                  )}

                  <div className="mb-6 p-4 bg-gray-50 border-l-4 border-gray-400 italic">
                    <p className="font-semibold text-gray-700 mb-2">Elemento de Apoyo ({idea.elementoApoyo?.tipo?.replace('_', ' ')})</p>
                    <p className="text-gray-800 leading-relaxed whitespace-pre-line">{idea.elementoApoyo?.contenido}</p>
                  </div>
                  <div className="space-y-6">
                    {idea.disparadores?.map((disparador, dIndex) => (
                      <div key={disparador.id || dIndex} className="pl-4 border-l-2 border-purple-200">
                        <p className="font-semibold text-blue-700">{disparador.disparador}</p>
                        <p className="mt-1 leading-relaxed whitespace-pre-line">{disparador.parrafo}</p>
                        
                        {/* Elementos de Apoyo del Disparador */}
                        {disparador.elementosApoyo && disparador.elementosApoyo.length > 0 && (
                          <div className="mt-3 pl-4 border-l border-gray-300">
                            <p 
                              className="font-semibold text-gray-500 mb-2 uppercase flex items-center gap-1"
                              style={{ fontSize: `${fontSize * 0.6}em` }}
                            >
                              <span className="text-blue-500"><FaBook /></span>
                              Elementos de Apoyo
                            </p>
                            <div className="space-y-2">
                              {disparador.elementosApoyo.map((elemento, eIndex) => {
                                // Determinar clase de fondo basada en el tipo
                                let backgroundClass = "bg-gray-50";
                                if (elemento.tipo === 'testimonio') {
                                  backgroundClass = "bg-purple-100";
                                } else if (elemento.tipo === 'ejemplo') {
                                  backgroundClass = "bg-green-100";
                                }
                                
                                return (
                                  <div key={elemento.id || eIndex} className={`${backgroundClass} rounded p-2`}>
                                    <div 
                                      className="font-medium text-gray-500 mb-1 italic"
                                      style={{ fontSize: `${fontSize * 0.6}em` }}
                                    >
                                      {elemento.tipo === 'cita_biblica' && 'Cita Bíblica'}
                                      {elemento.tipo === 'catecismo' && 'Catecismo CIC'}
                                      {elemento.tipo === 'reflexion' && 'Reflexión'}
                                      {elemento.tipo === 'ejemplo' && 'Ejemplo'}
                                      {elemento.tipo === 'testimonio' && 'Testimonio'}
                                    </div>
                                    <p 
                                      className="text-gray-700 whitespace-pre-line italic"
                                      style={{ fontSize: `${fontSize * 0.55}em` }}
                                    >
                                      {elemento.contenido}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Ejemplo Práctico */}
                  {idea.ejemploPractico && (
                    <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
                      <div className="flex items-center mb-2">
                        <MdWork className="text-lg mr-2 text-amber-600" />
                        <p className="font-semibold text-amber-800">Ejemplo Práctico</p>
                      </div>
                      <p className="text-gray-800 leading-relaxed whitespace-pre-line">{idea.ejemploPractico}</p>
                    </div>
                  )}

                  {/* Resultado Esperado */}
                  {idea.resultadoEsperado && (
                    <div className="mt-4 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg">
                      <div className="flex items-center mb-2">
                        <MdGpsFixed className="text-lg mr-2 text-emerald-600" />
                        <p className="font-semibold text-emerald-800">Resultado Esperado</p>
                      </div>
                      <p className="text-gray-800 leading-relaxed whitespace-pre-line">{idea.resultadoEsperado}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-gray-200">
            <h2 className="font-semibold mb-4 text-gray-800 border-l-4 border-purple-500 pl-4 text-3xl">Imperativos</h2>
            <div className="ml-5 leading-relaxed">
              <p className="whitespace-pre-line">{sermon.imperatives}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gray-100 p-4 border-t border-gray-300 z-10 flex justify-end items-center space-x-4">
        <SermonExportButton sermon={sermon} />
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="bg-blue-500 hover:bg-blue-700 rounded-full p-3 text-white shadow flex items-center justify-center text-2xl transition-all"
          aria-label="Configuración de vista"
        >
          <IoSettings />
        </button>
        {showSettings && (
          <div className="absolute bottom-20 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-full sm:w-64 left-4 sm:left-auto">
            <div className="mb-4">
              <label htmlFor="fontSizeSlider" className="block text-sm font-medium text-gray-700">Tamaño de Letra: {fontSize.toFixed(1)}em</label>
              <input
                id="fontSizeSlider"
                type="range"
                min="1.0"
                max="3.0"
                step="0.1"
                value={fontSize}
                onChange={(e) => setFontSize(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label htmlFor="contentWidthSlider" className="block text-sm font-medium text-gray-700">Ancho de Contenido: {contentWidth}%</label>
              <input
                id="contentWidthSlider"
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
    </div>
  );
};

export default SermonStudyView;
