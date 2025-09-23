import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

export default function PersonalResourceModal({
  isOpen,
  onClose,
  onSave,
  generating = false,
}) {
  if (!isOpen) return null;

  const [text, setText] = useState('');

  useEffect(() => {
    if (isOpen) setText('');
  }, [isOpen]);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Añadir Recurso Personal</h3>
          <button
            onClick={() => !generating && onClose && onClose()}
            className="text-2xl"
            disabled={generating}
          >
            <FaTimes />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          <textarea
            className="w-full h-full p-2 border rounded-md min-h-[300px]"
            placeholder="Copia y pega aquí tu texto. Este texto se tratará como un recurso más para la generación del sermón."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={generating}
          ></textarea>
        </div>
        <div className="flex justify-end p-4 border-t space-x-4">
          <button
            onClick={() => !generating && onClose && onClose()}
            className="px-4 py-2 rounded-md bg-gray-200"
            disabled={generating}
          >
            Cancelar
          </button>
          <button
            onClick={() => !generating && onSave && onSave(text)}
            className={`px-4 py-2 rounded-md bg-blue-500 text-white ${
              generating ? 'btn-disabled' : ''
            }`}
            disabled={generating}
          >
            Usar este Texto
          </button>
        </div>
      </div>
    </div>
  );
}
