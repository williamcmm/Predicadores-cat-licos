import React from 'react';

export default function SermonTypeSelector({ tipo, setTipo }) {
  const tipos = ['Homilía', 'Meditación', 'Catequesis', 'Reflexión'];
  return (
    <div className="my-6">
      <label className="block text-gray-700 text-sm font-semibold mb-2 uppercase">Tipo de Sermón:</label>
      <select
        value={tipo}
        onChange={e => setTipo(e.target.value)}
        className="p-2 rounded-md border-none text-base shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      >
        {tipos.map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
    </div>
  );
}
