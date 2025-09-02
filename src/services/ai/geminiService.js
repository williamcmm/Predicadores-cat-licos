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

  // try raw parse
  try { return JSON.parse(text); } catch (e) { /* continue */ }

  // try fenced code blocks
  const fenced = text.match(/```json\n([\s\S]*?)\n```/i);
  if (fenced && fenced[1]) {
    try { return JSON.parse(fenced[1]); } catch (e) { /* continue */ }
  }

  // try to extract first {...}
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = text.substring(firstBrace, lastBrace + 1).replace(/,\s*(?=[\]\}\]])/g, '');
    try { return JSON.parse(candidate); } catch (e) { /* continue */ }
  }

  // try to extract first [...]
  const firstArr = text.indexOf('[');
  const lastArr = text.lastIndexOf(']');
  if (firstArr !== -1 && lastArr !== -1 && lastArr > firstArr) {
    const candidate = text.substring(firstArr, lastArr + 1).replace(/,\s*(?=[\]\}\]])/g, '');
    try { return JSON.parse(candidate); } catch (e) { /* continue */ }
  }

  // try to find categories array
  const categoriesKey = /"categories"\s*:\s*/i;
  const mk = text.match(categoriesKey);
  if (mk && mk.index !== undefined) {
    const after = text.substring(mk.index + mk[0].length);
    const arr = findBalanced(after, 0, '[', ']');
    if (arr) {
      const candidate = ('{\"categories\":' + arr + '}').replace(/,\s*(?=[\]\}\]])/g, '');
      try { return JSON.parse(candidate); } catch (e) { /* continue */ }
    }
  }

  const err = new Error('Could not parse Gemini response as JSON');
  err.raw = text;
  throw err;
};

export async function searchResources(query) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `Busca recursos católicos para el tema: '${query}'. Devuelve SOLO JSON válido. La estructura esperada: { "categories": [ { "category": "...", "resources": [ { "title": "...", "source": "...", "description": "...", "excerpt": "...", "content": ["párrafo1", "párrafo2"] } ] } ] }.`;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    try { return extractAndParseJson(text); } catch (e) { console.error('parse error', e); return null; }
  } catch (e) { console.error('API error', e); return null; }
}

export async function searchResourcesProgressive(query, onCategory, categories = null) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const DEFAULT_CATS = [
    'DOCTRINA CATÓLICA','CATECISMO','SANTORAL CATÓLICO','CITAS BÍBLICAS RELEVANTES','REFLEXIONES SOBRE EL TEMA',
    'EJEMPLOS PRÁCTICOS','TESTIMONIOS Y EXPERIENCIAS','DATOS CIENTÍFICOS/HISTÓRICOS','VIDEOS DE YOUTUBE','REFERENCIAS DOCTRINALES','DOCUMENTOS OFICIALES DE LA IGLESIA'
  ];
  const cats = Array.isArray(categories) && categories.length > 0 ? categories : DEFAULT_CATS;

  for (const cat of cats) {
    let basePrompt = '';

    if (cat === 'CITAS BÍBLICAS RELEVANTES') {
      basePrompt = `Para el tema: "${query}", devuelve una lista de 5 a 10 citas bíblicas relevantes. Usa una traducción católica adecuada. Devuelve EXCLUSIVAMENTE JSON con la clave \"resources\" que sea un array de objetos. Cada objeto: { title, source, content: [versículos] }.`;
    } else {
      basePrompt = `Para la categoría: ${cat} y el tema: "${query}", devuelve SOLO JSON válido con la clave \"resources\" que sea un array de objetos. Cada objeto debe tener: title, source, description, y un content que sea un array de párrafos largos y sustanciales. Devuelve al menos 5 recursos por categoría cuando sea posible, máximo 10.`;
    }

    try {
      const result = await model.generateContent(basePrompt);
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
      console.error('Error requesting category', cat, err);
      onCategory(cat, []);
    }
    await new Promise(r => setTimeout(r, 400));
  }
  return true;
}

export async function generateGeneralSuggestions() {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `Genera exactamente 10 sugerencias de temas para sermones católicos, una por línea.`;
  const parseSuggestions = (text) => {
    if (!text || typeof text !== 'string') return [];
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const items = [];
    for (const line of lines) {
      const cleaned = line.replace(/^\d+[).\-\s]+/, '').replace(/^[\-\•\*\s]+/, '').trim();
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
    return []; // Return empty array on error to not break the flow
  }
}

export async function generateSermon(topic = '', searchResults = {}, liturgyContext = null) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // Step 1: Generate the main structure of the sermon
  const structurePrompt = `
    Tu tarea es generar la estructura principal de un sermón católico sobre el tema: "${topic}".
    Usa los siguientes recursos como base: ${JSON.stringify(searchResults)}
    REGLAS PARA EL JSON DE SALIDA:
    - La respuesta debe ser un único objeto JSON.
    - El objeto raíz debe tener: "title" (string), "introduction" (objeto con "presentation" y "motivation"), "imperatives" (string), y "ideas" (array).
    - El array "ideas" debe contener entre 3 y 5 objetos.
    - CADA objeto en "ideas" debe tener SOLAMENTE: "h1" (la idea principal) y "elementoApoyo" (un objeto con "tipo" y "contenido").
    - NO incluyas la clave "disparadores" en esta respuesta inicial.
  `;

  try {
    const structureResult = await model.generateContent(structurePrompt);
    const structureResponse = await structureResult.response;
    const structureText = await structureResponse.text();
    const sermonStructure = extractAndParseJson(structureText);

    // Step 2: Iterate and enrich each idea with disparadores
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

export async function generateDisparador(paragraph) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `Dada el siguiente párrafo de un sermón: "${paragraph}".\n\nGenera una única frase corta (máximo 10 palabras) que actúe como un "disparador mental" para recordar el contenido de este párrafo. La respuesta debe ser únicamente la frase, sin comillas ni texto adicional.`;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return await response.text();
  } catch (e) {
    console.error('generateDisparador error', e);
    return `Error: ${e.message}`;
  }
}