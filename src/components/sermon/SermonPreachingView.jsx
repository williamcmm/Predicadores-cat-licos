import { useState, useEffect, useRef, Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import { FaQuestionCircle } from "react-icons/fa";
import { IoSettings, IoClose } from "react-icons/io5";
import SermonExportButton from "./SermonExportButton";

const SermonPreachingView = ({ sermon, onClose, user }) => {
  const [fontSize, setFontSize] = useState(1.8);
  const [contentWidth, setContentWidth] = useState(80);
  const [showSettings, setShowSettings] = useState(false);
  const viewRef = useRef(null);

  useEffect(() => {
    const savedFontSize = localStorage.getItem("preachingViewFontSize");
    const savedContentWidth = localStorage.getItem("preachingViewContentWidth");
    if (savedFontSize) setFontSize(parseFloat(savedFontSize));
    if (savedContentWidth) setContentWidth(parseInt(savedContentWidth, 10));

    const enterFullscreen = async () => {
      if (viewRef.current && viewRef.current.requestFullscreen) {
        try {
          await viewRef.current.requestFullscreen();
        } catch (err) {
          console.error(
            `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
          );
        }
      }
    };
    enterFullscreen();

    const handleFullscreenChange = () => {
      if (document.fullscreenElement === null) {
        onClose();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
  }, [onClose]);

  useEffect(() => {
    localStorage.setItem("preachingViewFontSize", fontSize);
    localStorage.setItem("preachingViewContentWidth", contentWidth);
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
      <div
        ref={viewRef}
        className="fixed inset-0 bg-white z-50 flex items-center justify-center"
      >
        <p className="text-center text-gray-500">No hay sermón para mostrar.</p>
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-2xl"
        >
          <IoClose />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={viewRef}
      className={`fixed inset-0 bg-white z-50 flex flex-col ${
        !user ? "no-copy" : ""
      }`}
    >
      <button
        onClick={handleClose}
        className="fixed top-4 right-4 bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl z-20"
        aria-label="Cerrar vista de predicación"
      >
        <IoClose />
      </button>

      <div className="overflow-y-auto flex-grow pt-16 pb-28">
        <div
          className="sermon-preaching-view mx-auto font-sans text-gray-900 transition-all duration-300"
          style={{ maxWidth: `${contentWidth}%`, fontSize: `${fontSize}em` }}
        >
          <h1
            className="font-bold mb-10 text-center"
            style={{ fontSize: "2.5em" }}
          >
            {sermon.title}
          </h1>

          <div className="mb-12 p-6 bg-gray-50 rounded-lg">
            <h2
              className="font-semibold mb-4 border-b pb-2"
              style={{ fontSize: "1.8em" }}
            >
              Introducción
            </h2>
            <p className="mb-3">{sermon.introduction?.presentation}</p>
            <p>{sermon.introduction?.motivation}</p>
          </div>

          <div className="space-y-12">
            {sermon.ideas?.map((idea, index) => (
              <div key={idea.id || index} className="p-6 border-t pt-8">
                <h2
                  className="font-bold mb-5 text-blue-700"
                  style={{ fontSize: "2em" }}
                >{`Idea ${index + 1}: ${idea.h1}`}</h2>
                <div className="mb-8 p-5 bg-blue-50 border-l-4 border-blue-500">
                  <p className="italic leading-relaxed">
                    {idea.elementoApoyo?.contenido}
                  </p>
                </div>
                <div className="space-y-5 pl-5">
                  {idea.disparadores?.map((disparador, dIndex) => (
                    <Popover
                      key={disparador.id || dIndex}
                      className="relative flex items-start"
                    >
                      {({ open }) => (
                        <>
                          <span
                            className="text-blue-700 font-bold mr-4 flex-shrink-0"
                            style={{ fontSize: "1.5em" }}
                          >
                            •
                          </span>
                          <p className="font-semibold mr-2">
                            {disparador.disparador}
                          </p>

                          <Popover.Button className="text-gray-400 hover:text-blue-600 focus:outline-none pt-1">
                            <FaQuestionCircle />
                          </Popover.Button>

                          <Transition
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <Popover.Overlay className="fixed inset-0 z-10 bg-black/30" />
                          </Transition>

                          <Transition
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                          >
                            <Popover.Panel className="fixed inset-0 z-20 m-auto flex h-fit max-h-[80vh] w-full max-w-3xl flex-col rounded-xl bg-white p-6 shadow-xl">
                              <div className="flex-shrink-0 text-right">
                                <Popover.Button className="inline-flex items-center justify-center p-1 text-2xl font-bold text-gray-500 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                                  <span aria-hidden="true">&times;</span>
                                </Popover.Button>
                              </div>
                              <div className="overflow-y-auto mt-2">
                                <h3 className="text-xl font-bold text-blue-700 mb-4 pb-2 border-b">
                                  {disparador.disparador}
                                </h3>
                                <p
                                  className="text-gray-800"
                                  style={{
                                    fontSize: `${fontSize * 0.85}em`,
                                    lineHeight: 1.6,
                                  }}
                                >
                                  {disparador.parrafo}
                                </p>
                              </div>
                            </Popover.Panel>
                          </Transition>
                        </>
                      )}
                    </Popover>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t-2 border-gray-300">
            <h2 className="font-semibold mb-4" style={{ fontSize: "1.8em" }}>
              Imperativos
            </h2>
            <p>{sermon.imperatives}</p>
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
          <IoSettings size={20}/>
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
    </div>
  );
};

export default SermonPreachingView;
