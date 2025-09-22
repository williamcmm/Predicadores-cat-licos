import { useState, useEffect, useRef, Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import { FaBook, FaQuestionCircle } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { MdFlashOn, MdWork, MdGpsFixed } from "react-icons/md";
import { GoDotFill } from "react-icons/go";
import {
  usePreventTouchGestures,
  touchPreventionStyles,
} from "@/utils/touchGestures";
import { useViewModeStore } from "@/store/view-mode-store";
import { FullScreenViewSettingsBar } from "./FullScreenViewSettingsBar";

const SermonPreachingView = ({ sermon, user }) => {
  const [fontSize, setFontSize] = useState(1.8);
  const [contentWidth, setContentWidth] = useState(80);
  const viewRef = useRef(null);

  // store
  const { setMode } = useViewModeStore();

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
        setMode("edicion");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
  }, [setMode]);

  // Prevenir gestos táctiles que puedan salir del fullscreen
  usePreventTouchGestures(viewRef, true);

  useEffect(() => {
    localStorage.setItem("preachingViewFontSize", fontSize);
    localStorage.setItem("preachingViewContentWidth", contentWidth);
  }, [fontSize, contentWidth]);

  const handleClose = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      setMode("edicion");
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
      style={touchPreventionStyles}
    >
      <button
        onClick={handleClose}
        className="fixed top-4 right-4 bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl z-20"
        aria-label="Cerrar vista de predicación"
      >
        <IoClose />
      </button>

      <div
        className="overflow-y-auto flex-grow pt-16 pb-28"
        style={touchPreventionStyles}
      >
        <div
          className="sermon-preaching-view mx-auto font-sans text-gray-900 transition-all duration-300"
          style={{ maxWidth: `${contentWidth}%`, fontSize: `${fontSize}em` }}
        >
          <h1 className="font-bold mb-10 text-center text-5xl">
            {sermon.title}
          </h1>

          <div className="mb-5 p-6 bg-gray-50 rounded-lg">
            <h2 className="font-semibold mb-4 border-b pb-2 text-4xl">
              Introducción
            </h2>
            <p className="mb-3 whitespace-pre-line">
              {sermon.introduction?.presentation}
            </p>
          </div>
          <div className="mb-12 p-6 bg-green-50 rounded-lg">
            <h2 className="font-bold mb-4 border-b pb-2 text-green-800">
              Motivación
            </h2>
            <p className="whitespace-pre-line">
              {sermon.introduction?.motivation}
            </p>
          </div>

          <div className="space-y-12">
            {sermon.ideas?.map((idea, index) => (
              <div key={idea.id || index} className="p-6 border-t pt-8">
                <h2 className="font-bold mb-5 text-blue-700 text-4xl">{`Idea ${
                  index + 1
                }: ${idea.h1}`}</h2>

                {/* Línea Inicial Impactante */}
                {idea.lineaInicial && (
                  <div className="mb-6 p-4 bg-purple-50 border-l-4 border-purple-500 rounded-r-lg">
                    <div className="flex items-center mb-2">
                      <MdFlashOn className="text-lg mr-2 text-purple-600" />
                      <h3 className="font-semibold text-purple-800">
                        Línea Inicial Impactante
                      </h3>
                    </div>
                    <p className="text-gray-800 whitespace-pre-line">
                      {idea.lineaInicial}
                    </p>
                  </div>
                )}

                <div className="mb-8 p-5 bg-blue-50 border-l-4 border-blue-500">
                  <p className="italic leading-relaxed whitespace-pre-line">
                    {idea.elementoApoyo?.contenido}
                  </p>
                </div>
                <div className="space-y-5 pl-5">
                  {idea.disparadores?.map((disparador, dIndex) => (
                    <Popover
                      key={disparador.id || dIndex}
                      className="relative flex items-center"
                    >
                      {() => (
                        <>
                          <div className="text-blue-700 font-bold mr-4 flex-shrink-0 text-2xl">
                            <GoDotFill size={20} />
                          </div>
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
                                <p className="text-gray-800 leading-relaxed whitespace-pre-line mb-4">
                                  {disparador.parrafo}
                                </p>

                                {/* Elementos de Apoyo del Disparador */}
                                {disparador.elementosApoyo &&
                                  disparador.elementosApoyo.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                      <h4
                                        className="font-semibold text-gray-600 mb-3 flex items-center gap-2"
                                        style={{
                                          fontSize: `${fontSize * 0.6}em`,
                                        }}
                                      >
                                        <span className="text-blue-500">
                                          <FaBook />
                                        </span>
                                        Elementos de Apoyo
                                      </h4>
                                      <div className="space-y-3">
                                        {disparador.elementosApoyo.map(
                                          (elemento, eIndex) => {
                                            // Determinar clase de fondo basada en el tipo
                                            let backgroundClass = "bg-gray-50";
                                            if (
                                              elemento.tipo === "testimonio"
                                            ) {
                                              backgroundClass = "bg-purple-100";
                                            } else if (
                                              elemento.tipo === "ejemplo"
                                            ) {
                                              backgroundClass = "bg-green-100";
                                            }

                                            return (
                                              <div
                                                key={elemento.id || eIndex}
                                                className={`${backgroundClass} rounded p-3`}
                                              >
                                                <div
                                                  className="font-medium text-gray-500 mb-1 uppercase italic"
                                                  style={{
                                                    fontSize: `${
                                                      fontSize * 0.6
                                                    }em`,
                                                  }}
                                                >
                                                  {elemento.tipo ===
                                                    "cita_biblica" &&
                                                    "Cita Bíblica"}
                                                  {elemento.tipo ===
                                                    "catecismo" &&
                                                    "Catecismo CIC"}
                                                  {elemento.tipo ===
                                                    "reflexion" && "Reflexión"}
                                                  {elemento.tipo ===
                                                    "ejemplo" && "Ejemplo"}
                                                  {elemento.tipo ===
                                                    "testimonio" &&
                                                    "Testimonio"}
                                                </div>
                                                <p
                                                  className="text-gray-700 whitespace-pre-line italic"
                                                  style={{
                                                    fontSize: `${
                                                      fontSize * 0.55
                                                    }em`,
                                                  }}
                                                >
                                                  {elemento.contenido}
                                                </p>
                                              </div>
                                            );
                                          }
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </Popover.Panel>
                          </Transition>
                        </>
                      )}
                    </Popover>
                  ))}
                </div>

                {/* Ejemplo Práctico */}
                {idea.ejemploPractico && (
                  <div className="mt-8 mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
                    <div className="flex items-center mb-2">
                      <MdWork className="text-lg mr-2 text-amber-600" />
                      <h3 className="font-semibold text-amber-800">
                        Ejemplo Práctico
                      </h3>
                    </div>
                    <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                      {idea.ejemploPractico}
                    </p>
                  </div>
                )}

                {/* Resultado Esperado */}
                {idea.resultadoEsperado && (
                  <div className="mt-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg">
                    <div className="flex items-center mb-2">
                      <MdGpsFixed className="text-lg mr-2 text-emerald-600" />
                      <h3 className="font-semibold text-emerald-800">
                        Resultado Esperado
                      </h3>
                    </div>
                    <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                      {idea.resultadoEsperado}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t-2 border-gray-300">
            <h2 className="font-semibold mb-4 text-3xl">Imperativos</h2>
            <p className="whitespace-pre-line">{sermon.imperatives}</p>
          </div>
        </div>
      </div>

      <FullScreenViewSettingsBar
        fontSize={fontSize}
        setFontSize={setFontSize}
        contentWidth={contentWidth}
        setContentWidth={setContentWidth}
        sermon={sermon}
      />
    </div>
  );
};

export default SermonPreachingView;
