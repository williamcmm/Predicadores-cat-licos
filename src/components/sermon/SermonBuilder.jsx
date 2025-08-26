import React from 'react';

export default function SermonBuilder({ titulo, contenido, ideas, tipo }) {
  return (
    <div className="mt-8 bg-white/5 p-4 rounded-lg">
      <h3 className="text-white font-bold mb-4">Vista Previa del Sermón</h3>
      <p className="text-gray-400 mb-2"><strong>Tipo:</strong> {tipo}</p>
      <h4 className="text-white font-bold mb-4">{titulo}</h4>
      <div className="text-white mb-4">{contenido}</div>
      <ul className="text-white pl-4">
        {ideas.map((idea, idx) => (
          <li key={idx} className="mb-2">• {idea}</li>
        ))}
      </ul>
    </div>
  );
}
