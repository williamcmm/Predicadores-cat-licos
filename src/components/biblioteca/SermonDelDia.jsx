import React from 'react';

const SermonDelDia = () => {
  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Sermón del Día</h2>
      <p className="text-gray-600">
        Aquí se mostrará el contenido del Sermón del Día. Esta sección es visible para todos los usuarios que han iniciado sesión.
      </p>
      {/* Más adelante, aquí se cargará el sermón desde Firestore */}
    </div>
  );
};

export default SermonDelDia;
