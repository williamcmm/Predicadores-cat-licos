import React from 'react';

const SermonExportButton = ({ sermon }) => {

  const generateHtmlContent = () => {
    let html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>${sermon.title}</title>
        <style>
          @page {
            margin: 0.5in; /* Further reduced margins */
          }
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.5;
            color: #333;
            font-size: 16pt;
          }
          h1, h2, h3 { 
            color: #005a9e; 
            line-height: 1.2;
          }
          h1 { font-size: 2.5em; text-align: center; margin-bottom: 30px; }
          h2 { font-size: 2em; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 40px; }
          h3 { font-size: 1.5em; }
          .page-break { page-break-before: always; }
          .section-title { background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 2em; margin: 40px 0; }
          .studio-view, .preaching-view { margin-bottom: 50px; }
          .studio-disparador { font-weight: bold; margin-left: 20px; }
          .studio-parrafo { margin-left: 40px; color: #555; margin-bottom: 1.5em; /* Added space after paragraph */ }
          .preaching-disparador { font-weight: bold; margin-left: 20px; margin-bottom: 1.5em; }
        </style>
      </head>
      <body>
    `;

    // --- MODO ESTUDIO ---
    html += `<div class="section-title">Modo Estudio</div>`;
    html += `<div class="studio-view">`;
    html += `<h1>${sermon.title}</h1>`;
    html += `<h2>Introducción</h2>`;
    html += `<p>${sermon.introduction?.presentation || ''}</p>`;
    html += `<p>${sermon.introduction?.motivation || ''}</p>`;

    sermon.ideas?.forEach((idea, index) => {
      html += `<h2>Idea ${index + 1}: ${idea.h1}</h2>`;
      html += `<h3>Elemento de Apoyo:</h3><p>${idea.elementoApoyo?.contenido || ''}</p>`;
      html += `<h3>Disparadores y Párrafos:</h3>`;
      idea.disparadores?.forEach(d => {
        html += `<div class="studio-disparador">• ${d.disparador}</div>`;
        html += `<div class="studio-parrafo">${d.parrafo}</div>`;
      });
    });

    html += `<h2>Imperativos</h2>`;
    html += `<p>${sermon.imperatives || ''}</p>`;
    html += `</div>`;

    // --- MODO PREDICACIÓN ---
    html += `<div class="page-break"></div>`;
    html += `<div class="section-title">Modo Predicación</div>`;
    html += `<div class="preaching-view">`;
    html += `<h1>${sermon.title}</h1>`;
    html += `<h2>Introducción</h2>`;
    html += `<p>${sermon.introduction?.presentation || ''}</p>`;
    html += `<p>${sermon.introduction?.motivation || ''}</p>`;

    sermon.ideas?.forEach((idea, index) => {
      html += `<h2>Idea ${index + 1}: ${idea.h1}</h2>`;
      html += `<p><em>${idea.elementoApoyo?.contenido || ''}</em></p>`;
      idea.disparadores?.forEach(d => {
        html += `<div class="preaching-disparador">• ${d.disparador}</div>`;
      });
    });

    html += `<h2>Imperativos</h2>`;
    html += `<p>${sermon.imperatives || ''}</p>`;
    html += `</div>`;

    html += `</body></html>`;
    return html;
  };

  const handleExport = () => {
    if (!sermon || !sermon.title) {
      alert('El sermón no tiene título. Por favor, añade un título antes de exportar.');
      return;
    }

    const htmlContent = generateHtmlContent();
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${sermon.title}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
    >
      Descargar
    </button>
  );
};

export default SermonExportButton;
