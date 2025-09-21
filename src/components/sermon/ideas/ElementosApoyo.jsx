import React from "react";
import { FaBook } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";

export default function ElementosApoyo({ elementos = [], onElementoChange, onDeleteElemento }) {
  if (!elementos || elementos.length === 0) return null;

  return (
    <div className="bg-white rounded-md border border-gray-200 p-4 mb-3">
      <h5 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
        <span className="text-blue-500"><FaBook /></span>
        Elementos de Apoyo ({elementos.length}/3)
      </h5>
      {elementos.map((elemento) => (
        <div key={elemento.id} className="bg-gray-50 rounded-md p-3 mb-3 relative">
          <button
            onClick={() => onDeleteElemento(elemento.id)}
            className="absolute top-2 right-2 bg-red-400 text-white border-none w-5 h-5 rounded-full cursor-pointer text-xs flex items-center justify-center transition-colors hover:bg-red-500"
            aria-label="Eliminar elemento de apoyo"
          >
            <FaXmark size={10} />
          </button>
          <div className="pr-8">
            <div className="mb-2">
              <select
                value={elemento.tipo}
                onChange={(e) => onElementoChange(elemento.id, "tipo", e.target.value)}
                className="w-full p-1.5 border border-gray-300 rounded text-xs bg-white"
              >
                <option value="cita_biblica">Cita Bíblica</option>
                <option value="catecismo">Catecismo CIC</option>
                <option value="reflexion">Reflexión</option>
                <option value="ejemplo">Ejemplo</option>
                <option value="testimonio">Testimonio</option>
              </select>
            </div>
            <textarea
              value={elemento.contenido}
              onChange={(e) => onElementoChange(elemento.id, "contenido", e.target.value)}
              placeholder="Contenido del elemento de apoyo..."
              className="w-full p-2 border border-gray-300 rounded text-xs resize-y"
              rows={2}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
