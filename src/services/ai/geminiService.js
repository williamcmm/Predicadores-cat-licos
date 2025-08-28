import { GoogleGenerativeAI } from '@google/generative-ai';

// geminiService: consolidated, single-definition module
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const findBalanced = (str, startIdx, openChar, closeChar) => {
  let depth = 0;
  let start = -1;
  for (let i = startIdx; i < str.length; i++) {
    const ch = str[i];
    if (ch === openChar) {
      if (start === -1) start = i;
      depth++;
    } else if (ch === closeChar) {
      depth--;
      if (depth === 0 && start !== -1) return str.substring(start, i + 1);
    }
  }
  return null;
};

const extractAndParseJson = (text) => {
  if (!text || typeof text !== 'string') throw new Error('Empty response text');
  try { return JSON.parse(text); } catch (e) { /* continue */ }
  const fenced = text.match(/```json\n([\s\S]*?)\n```/i);
  if (fenced && fenced[1]) {
    try { return JSON.parse(fenced[1]); } catch (e) { /* continue */ }
  }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = text.substring(firstBrace, lastBrace + 1).replace(/,\s*(?=[\\\]\}\}])/g, '');
    try { return JSON.parse(candidate); } catch (e) { /* continue */ }
  }
  const firstArr = text.indexOf('[');
  const lastArr = text.lastIndexOf(']');
  if (firstArr !== -1 && lastArr !== -1 && lastArr > firstArr) {
    const candidate = text.substring(firstArr, lastArr + 1).replace(/,\s*(?=[\\\]\}\}])/g, '');
    try { return JSON.parse(candidate); } catch (e) { /* continue */ }
  }
  const categoriesKey = /"categories"\s*:\s*/i;
  const mk = text.match(categoriesKey);
  if (mk && mk.index !== undefined) {
    const after = text.substring(mk.index + mk[0].length);
    const arr = findBalanced(after, 0, '[', ']');
    if (arr) {
      const candidate = ('{\"categories\":' + arr + '}').replace(/,\s*(?=[\\\]\}\}])/g, '');
      try { return JSON.parse(candidate); } catch (e) { /* continue */ }
    }
  }
  const err = new Error('Could not parse Gemini response as JSON');
  err.raw = text;
  throw err;
};

export async function searchResourcesProgressive(query, onCategory, categories = null, signal) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const DEFAULT_CATS = [ 'DOCTRINA CATÓLICA','CATECISMO','SANTORAL CATÓLICO','CITAS BÍBLICAS RELEVANTES','REFLEXIONES SOBRE EL TEMA', 'EJEMPLOS PRÁCTICOS','TESTIMONIOS Y EXPERIENCIAS','DATOS CIENTÍFICOS/HISTÓRICOS','VIDEOS DE YOUTUBE','REFERENCIAS DOCTRINALES','DOCUMENTOS OFICIALES DE LA IGLESIA' ];
  const cats = Array.isArray(categories) && categories.length > 0 ? categories : DEFAULT_CATS;
  for (const cat of cats) {
    if (signal?.aborted) {
      console.log('Búsqueda progresiva cancelada por el usuario.');
      break;
    }
    let basePrompt = '';
    if (cat === 'CITAS BÍBLICAS RELEVANTES') {
      basePrompt = `Para el tema: "${query}", devuelve una lista de 5 a 10 citas bíblicas relevantes. Usa una traducción católica adecuada. Devuelve EXCLUSIVAMENTE JSON con la clave "resources" que sea un array de objetos. Cada objeto: { title, source, content: [versículos] }.`;
    } else if (cat === 'REFLEXIONES SOBRE EL TEMA') {
      basePrompt = `
      Actúa como un sabio autor de reflexiones espirituales, con un profundo conocimiento de la condición humana y de la sana doctrina cristiana.
      Para el tema "${query}", genera una lista de hasta 10 reflexiones prácticas y transformadoras, si el tema lo permite.
      
      Instrucciones Detalladas:
      1. Enfoque: Cada reflexión debe aplicar el tema a la vida cotidiana (familia, trabajo, desafíos personales) y mostrar un camino de crecimiento y esperanza. El tono debe ser inspirador y universal.
      2. Fuente de Inspiración: Basa tus reflexiones en el conocimiento general de los grandes libros sobre espiritualidad y vida interior, pero sin mencionarlos directamente.
      3. Formato de Salida: La respuesta debe ser únicamente un objeto JSON. El objeto debe contener una clave "resources", que será un array de objetos. Cada objeto de recurso debe tener:
        - title: Un título breve y atractivo para la reflexión.
        - source: El valor de este campo debe ser siempre "Reflexión".
        - content: Un array de strings, donde cada string es un párrafo de la reflexión.

      Reglas de Contenido Estrictas:
      - NO Nombres Propios: No debes mencionar ningún nombre de autor, libro, persona, iglesia o denominación.
      - NO Palabras Clave: No utilices las palabras "Pastor" ni "Jehová".
      - Citas Bíblicas: Si excepcionalmente necesitas usar una cita bíblica, debe ser exclusivamente de la traducción "Dios Habla Hoy" (DHH). Queda prohibido el uso de Reina Valera (RV), Nueva Versión Internacional (NVI) o cualquier otra.
      `;
    } else {
      basePrompt = `Para la categoría: ${cat} y el tema: "${query}", devuelve SOLO JSON válido con la clave "resources" que sea un array de objetos. Cada objeto debe tener: title, source, description, y un content que sea un array de párrafos largos y sustanciales. Devuelve al menos 5 recursos por categoría cuando sea posible, máximo 10.`;
    }
    try {
      const result = await model.generateContent(basePrompt, { signal });
      const response = await result.response;
      const text = await response.text();
      try {
        const parsed = extractAndParseJson(text);
        let resources = null;
        if (Array.isArray(parsed)) resources = parsed;
        else if (parsed && parsed.resources && Array.isArray(parsed.resources)) resources = parsed.resources;
        else if (parsed && parsed.categories) {
          const found = parsed.categories.find(c => (c.category || '').toUpperCase().includes((cat || '').split(' ')[0]));
          resources = found ? found.resources : [];
        }
        resources = Array.isArray(resources) ? resources.slice(0, 10) : [];
        onCategory(cat, resources);
      } catch (parseErr) {
        console.error('Could not parse category response for', cat, parseErr);
        onCategory(cat, []);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log(`Búsqueda para ${cat} cancelada.`);
      } else {
        console.error('Error requesting category', cat, err);
      }
      onCategory(cat, []);
    }
    await new Promise(r => setTimeout(r, 400));
  }
  return true;
}

export async function generateSermon(topic = '', searchResults = []) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const structurePrompt = `
    Tu tarea es generar la estructura principal de un sermón católico sobre el tema: "${topic}".

    Usa los siguientes recursos de búsqueda para construir el sermón. Si entre los recursos se encuentra la categoría "RECURSOS PERSONALES", considera su contenido como una fuente de inspiración de alta prioridad e integra sus ideas clave de forma coherente en la estructura final.
    
    Recursos disponibles: ${JSON.stringify(searchResults)}
    
    REGLAS PARA EL JSON DE SALIDA:
    - La respuesta debe ser un único objeto JSON.
    - El objeto raíz debe tener: "title" (string), "introduction" (objeto con "presentation" y "motivation"), "imperatives" (string), y "ideas" (array).
    - El array "ideas" debe contener entre 5 y 7 objetos.
    - CADA objeto en "ideas" debe tener SOLAMENTE: "h1" (la idea principal) y "elementoApoyo" (un objeto con "tipo" y "contenido").
    - NO incluyas la clave "disparadores" en esta respuesta inicial.
  `;

  try {
    const structureResult = await model.generateContent(structurePrompt);
    const structureResponse = await structureResult.response;
    const structureText = await structureResponse.text();
    const sermonStructure = extractAndParseJson(structureText);

    for (const idea of sermonStructure.ideas) {
      const disparadoresArray = await generateDisparadoresForIdea(idea, topic, model);
      idea.disparadores = disparadoresArray;
    }

    return sermonStructure;

  } catch (err) {
    console.error('generateSermon error', err);
    if (err.raw) {
      throw new Error(`La IA devolvió un formato inválido en la estructura principal. Contenido: ${err.raw.substring(0, 200)}...`);
    }
    throw err;
  }
}

async function generateDisparadoresForIdea(idea, topic, model) {
  const prompt = `
    Dada la siguiente idea principal de un sermón: "${idea.h1}",
    y su texto de apoyo: "${idea.elementoApoyo.contenido}".

    Genera un array de 3 a 4 objetos JSON. Cada objeto DEBE tener dos claves:
    1. "disparador": una frase corta que resuma el punto.
    2. "parrafo": un párrafo largo y bien desarrollado que explique el punto en detalle.

    La respuesta debe ser únicamente el array JSON, sin texto adicional.
  `;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    return extractAndParseJson(text);
  } catch (error) {
    console.error(`Error generando disparadores para la idea "${idea.h1}":`, error);
    return [];
  }
}

export async function generateGeneralSuggestions() {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `Genera exactamente 10 sugerencias de temas para sermones católicos, una por línea.`;
  const parseSuggestions = (text) => {
    if (!text || typeof text !== 'string') return [];
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const items = [];
    for (const line of lines) {
      const cleaned = line.replace(/^\d+[).\-\s]+/, '').replace(/^[\-\\u2022\*\s]+/, '').trim();
      if (cleaned) items.push(cleaned);
    }
    if (items.length < 6) {
      const parts = text.split(/[;,\n\u2022\-]/).map(p => p.trim()).filter(p => p.length > 6 && p.length < 120);
      for (const p of parts) { if (!items.includes(p)) items.push(p); if (items.length >= 10) break; }
    }
    return Array.from(new Set(items)).slice(0, 10);
  };
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    return parseSuggestions(text);
  } catch (e) { console.error('suggestions error', e); return []; }
}

export async function generateAlternative(sermon, field) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const fieldValue = field.split('.').reduce((o, i) => (o ? o[i] : undefined), sermon);
  const prompt = `Para el sermón con título "${sermon.title}", genera una alternativa para el campo "${field}". El contenido actual es: "${fieldValue}". La respuesta debe ser solo el texto alternativo, sin adornos.`;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return await response.text();
  } catch (e) {
    console.error('generateAlternative error', e);
    return `Error al generar alternativa: ${e.message}`;
  }
}