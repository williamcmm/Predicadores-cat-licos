export const generateHtmlContent = (sermon) => {
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
          
          /* Estilos para nuevos elementos */
          .linea-inicial { 
            background-color: #fef3c7; 
            border-left: 4px solid #f59e0b; 
            padding: 15px; 
            margin: 20px 0; 
            font-style: italic; 
            font-weight: bold; 
          }
          .ejemplo-practico { 
            background-color: #fef3c7; 
            border-left: 4px solid #d97706; 
            padding: 15px; 
            margin: 20px 0; 
          }
          .resultado-esperado { 
            background-color: #d1fae5; 
            border-left: 4px solid #10b981; 
            padding: 15px; 
            margin: 20px 0; 
          }
          .element-header { 
            font-weight: bold; 
            color: #374151; 
            margin-bottom: 8px; 
          }
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
      
      // Línea Inicial
      if (idea.lineaInicial) {
        html += `<div class="linea-inicial">
          <div class="element-header">⚡ Línea Inicial Impactante:</div>
          "${idea.lineaInicial}"
        </div>`;
      }
      
      // Elemento de Apoyo
      html += `<h3>Elemento de Apoyo (${idea.elementoApoyo?.tipo?.replace('_', ' ') || 'No especificado'}):</h3>
      <p>${idea.elementoApoyo?.contenido || ''}</p>`;
      
      // Disparadores y Párrafos
      html += `<h3>Disparadores y Párrafos:</h3>`;
      idea.disparadores?.forEach(d => {
        html += `<div class="studio-disparador">• ${d.disparador}</div>`;
        html += `<div class="studio-parrafo">${d.parrafo}</div>`;
        
        // Elementos de apoyo del disparador
        if (d.elementosApoyo && d.elementosApoyo.length > 0) {
          html += `<div style="margin-left: 20px; margin-top: 10px; margin-bottom: 15px;">`;
          html += `<div style="font-size: 11px; font-weight: bold; color: #666; margin-bottom: 8px;">📖 Elementos de Apoyo:</div>`;
          d.elementosApoyo.forEach(elemento => {
            let tipoLabel = 'Reflexión';
            let backgroundColor = '#f5f5f5';
            
            // Determinar etiqueta y color basado en el tipo
            switch(elemento.tipo) {
              case 'cita_biblica':
                tipoLabel = 'Cita Bíblica';
                backgroundColor = '#f5f5f5';
                break;
              case 'catecismo':
                tipoLabel = 'Catecismo CIC';
                backgroundColor = '#f5f5f5';
                break;
              case 'testimonio':
                tipoLabel = 'Testimonio';
                backgroundColor = '#f3e8ff'; // Morado claro como en predicación
                break;
              case 'ejemplo':
                tipoLabel = 'Ejemplo';
                backgroundColor = '#f0fdf4'; // Verde claro como en predicación
                break;
              default:
                tipoLabel = 'Reflexión';
                backgroundColor = '#f5f5f5';
            }
            
            html += `<div style="background-color: ${backgroundColor}; padding: 8px; margin-bottom: 5px; border-left: 3px solid #ccc; font-size: 11px;">`;
            html += `<div style="font-weight: bold; color: #666; margin-bottom: 3px;">${tipoLabel}</div>`;
            html += `<div style="font-style: italic;">${elemento.contenido}</div>`;
            html += `</div>`;
          });
          html += `</div>`;
        }
      });
      
      // Ejemplo Práctico
      if (idea.ejemploPractico) {
        html += `<div class="ejemplo-practico">
          <div class="element-header">💼 Ejemplo Práctico:</div>
          ${idea.ejemploPractico}
        </div>`;
      }
      
      // Resultado Esperado
      if (idea.resultadoEsperado) {
        html += `<div class="resultado-esperado">
          <div class="element-header">🎯 Resultado Esperado:</div>
          ${idea.resultadoEsperado}
        </div>`;
      }
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
      
      // Línea Inicial (más prominente en modo predicación)
      if (idea.lineaInicial) {
        html += `<div class="linea-inicial">
          <strong>"${idea.lineaInicial}"</strong>
        </div>`;
      }
      
      // Elemento de Apoyo
      html += `<p><em>${idea.elementoApoyo?.contenido || ''}</em></p>`;
      
      // Disparadores (solo los disparadores principales)
      idea.disparadores?.forEach(d => {
        html += `<div class="preaching-disparador">• ${d.disparador}</div>`;
        
        // Nota sobre elementos de apoyo disponibles
        if (d.elementosApoyo && d.elementosApoyo.length > 0) {
          const testimonios = d.elementosApoyo.filter(e => e.tipo === 'testimonio').length;
          const ejemplos = d.elementosApoyo.filter(e => e.tipo === 'ejemplo').length;
          const otros = d.elementosApoyo.length - testimonios - ejemplos;
          
          let descripcion = [];
          if (testimonios > 0) descripcion.push(`${testimonios} testimonio${testimonios > 1 ? 's' : ''}`);
          if (ejemplos > 0) descripcion.push(`${ejemplos} ejemplo${ejemplos > 1 ? 's' : ''}`);
          if (otros > 0) descripcion.push(`${otros} otro${otros > 1 ? 's' : ''} elemento${otros > 1 ? 's' : ''}`);
          
          html += `<div style="font-size: 10px; color: #888; margin-left: 20px; margin-bottom: 8px; font-style: italic;">
            (${descripcion.join(', ')} de apoyo disponible${d.elementosApoyo.length > 1 ? 's' : ''})
          </div>`;
        }
      });
      
      // Ejemplo Práctico (simplificado para predicación)
      if (idea.ejemploPractico) {
        html += `<div class="ejemplo-practico">
          <strong>Ejemplo:</strong> ${idea.ejemploPractico}
        </div>`;
      }
      
      // Resultado Esperado
      if (idea.resultadoEsperado) {
        html += `<div class="resultado-esperado">
          <strong>Objetivo:</strong> ${idea.resultadoEsperado}
        </div>`;
      }
    });

    html += `<h2>Imperativos</h2>`;
    html += `<p>${sermon.imperatives || ''}</p>`;
    html += `</div>`;

    html += `</body></html>`;
    return html;
  };