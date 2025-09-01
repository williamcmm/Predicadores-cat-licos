import React, { useState } from 'react';
import SermonStudyView from '../sermon/SermonStudyView';
import SermonPreachingView from '../sermon/SermonPreachingView';

const SermonDelDia = ({ sermon, loading }) => {
  const [modo, setModo] = useState('edicion');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando sermón del día...</p>
        </div>
      </div>
    );
  }

  if (!sermon) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No hay sermón del día
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            El predicador aún no ha marcado un sermón para hoy. 
            Cuando lo haga, aparecerá aquí para que puedas seguir 
            la predicación en tiempo real.
          </p>
        </div>
      </div>
    );
  }

  const fechaActivacion = sermon.fechaActivacionHoy?.toDate ? 
    sermon.fechaActivacionHoy.toDate().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'Hoy';

  return (
    <div className="h-full flex flex-col">
      {/* Header del sermón del día */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-lg mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🎯</span>
          <h2 className="text-lg font-bold">Sermón de Hoy</h2>
        </div>
        <h3 className="text-xl font-semibold mb-1">{sermon.title}</h3>
        <p className="text-purple-100 text-sm">Activado: {fechaActivacion}</p>
      </div>

      {/* Selector de modo de vista */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
        <button
          onClick={() => setModo('edicion')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            modo === 'edicion'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-600 hover:text-purple-700'
          }`}
        >
          📝 Vista Edición
        </button>
        <button
          onClick={() => setModo('estudio')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            modo === 'estudio'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-600 hover:text-purple-700'
          }`}
        >
          📖 Modo Estudio
        </button>
        <button
          onClick={() => setModo('predicacion')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            modo === 'predicacion'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-600 hover:text-purple-700'
          }`}
        >
          🎤 Modo Predicación
        </button>
      </div>

      {/* Nota instructiva */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4 rounded">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              💡 <strong>Sigue la predicación:</strong> Cambia entre los diferentes modos 
              para seguir el sermón como lo está presentando el predicador en vivo.
            </p>
          </div>
        </div>
      </div>

      {/* Contenido del sermón según el modo */}
      <div className="flex-1 overflow-auto">
        {modo === 'edicion' && (
          <div className="space-y-4">
            {/* Vista de edición readonly */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-800 mb-2">Título</h4>
              <p className="text-gray-700 mb-4">{sermon.title}</p>
              
              {sermon.introduction && (
                <>
                  <h4 className="font-semibold text-gray-800 mb-2">Presentación</h4>
                  <p className="text-gray-700 mb-4 whitespace-pre-line">{sermon.introduction.presentation}</p>
                  
                  <h4 className="font-semibold text-gray-800 mb-2">Motivación</h4>
                  <p className="text-gray-700 mb-4 whitespace-pre-line">{sermon.introduction.motivation}</p>
                </>
              )}
              
              {sermon.ideas && sermon.ideas.length > 0 && (
                <>
                  <h4 className="font-semibold text-gray-800 mb-2">Ideas Principales</h4>
                  {sermon.ideas.map((idea, index) => (
                    <div key={idea.id || index} className="bg-gray-50 p-3 rounded mb-3">
                      <h5 className="font-medium text-gray-800 mb-2">💡 {idea.h1}</h5>
                      {idea.disparadores && idea.disparadores.map((disp, dIndex) => (
                        <div key={disp.id || dIndex} className="ml-4 mb-2 text-sm text-gray-600">
                          <p><strong>{disp.disparador}:</strong> {disp.parrafo}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </>
              )}
              
              {sermon.imperatives && (
                <>
                  <h4 className="font-semibold text-gray-800 mb-2">Imperativos</h4>
                  <p className="text-gray-700 whitespace-pre-line">{sermon.imperatives}</p>
                </>
              )}
            </div>
          </div>
        )}
        
        {modo === 'estudio' && (
          <SermonStudyView sermon={sermon} />
        )}
        
        {modo === 'predicacion' && (
          <SermonPreachingView sermon={sermon} />
        )}
      </div>
    </div>
  );
};

export default SermonDelDia;
