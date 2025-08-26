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
    const candidate = text.substring(firstBrace, lastBrace + 1).replace(/,\s*(?=[}\]])/g, '');
    try { return JSON.parse(candidate); } catch (e) { /* continue */ }
  }

  // try to extract first [...] 
  const firstArr = text.indexOf('[');
  const lastArr = text.lastIndexOf(']');
  if (firstArr !== -1 && lastArr !== -1 && lastArr > firstArr) {
    const candidate = text.substring(firstArr, lastArr + 1).replace(/,\s*(?=[}\]])/g, '');
    try { return JSON.parse(candidate); } catch (e) { /* continue */ }
  }

  // try to find categories array
  const categoriesKey = /"categories"\s*:\s*/i;
  const mk = text.match(categoriesKey);
  if (mk && mk.index !== undefined) {
    const after = text.substring(mk.index + mk[0].length);
    const arr = findBalanced(after, 0, '[', ']');
    if (arr) {
      const candidate = ('{"categories":' + arr + '}').replace(/,\s*(?=[}\]])/g, '');
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
      const parts = text.split(/[;,\n•\-]+/).map(p => p.trim()).filter(p => p.length > 6 && p.length < 120);
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

// ==================================================================
// NEW 3-STEP SERMON GENERATION LOGIC
// ==================================================================

const masterPrompt = `Eres un asistente experto en la creación de sermones católicos. Tu objetivo es ayudar a un predicador a estructurar un mensaje profundo y coherente. Debes seguir las instrucciones al pie de la letra y devolver únicamente JSON válido.`;

async function generateSermonStep1_Structure(topic, searchResults, categories, model) {
  const prompt = `
    ${masterPrompt}    
    **Paso 1: Crear la Estructura Central**

    **Tema del Sermón:** "${topic}"
    **Orden de Prioridad de Categorías:**
    ${categories.join(', ')}

    **Recursos Disponibles:**
    ${JSON.stringify(searchResults).substring(0, 3000)}...

    **Instrucción:**
    Analiza los recursos y genera ÚNICAMENTE:
    1. Un **TÍTULO** atractivo para el sermón.
    2. Exactamente **cinco 'Ideas Principales' (H1)**. Cada H1 debe ser una sola frase concisa y potente.

    **Formato de Salida (JSON estricto):**
    {
      "title": "...",
      "ideas": [
        { "h1": "..." },
        { "h1": "..." },
        { "h1": "..." },
        { "h1": "..." },
        { "h1": "..." }
      ]
    }
  `;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = await response.text();
  try {
    return extractAndParseJson(text);
  } catch (e) {
    console.error("Error en Paso 1 (Estructura)", e);
    e.step = 1;
    throw e;
  }
}

async function generateSermonStep2_Content(sermonStructure, topic, searchResults, categories, model) {
  const prompt = `
    ${masterPrompt}

    **Paso 2: Desarrollar el Contenido Principal**

    **Tema del Sermón:** "${topic}"
    **Título:** "${sermonStructure.title}"
    **Ideas Principales (H1):**
    ${sermonStructure.ideas.map((idea, i) => `${i+1}. ${idea.h1}`).join('\n')}

    **Orden de Prioridad de Categorías:**
    ${categories.join(', ')}

    **Recursos Disponibles:**
    ${JSON.stringify(searchResults).substring(0, 3000)}...

    **Instrucción:**
    Desarrolla cada una de las cinco ideas. Para cada una, debes:
    1.  Generar una **"introduccion"** con "presentacion" y "motivacion".
    2.  Seleccionar un **"elementoApoyo"**: El texto más relevante (cita bíblica, doctrinal, etc.) de los recursos que fundamente el H1. Debe ser un objeto con "tipo" y "contenido".
    3.  Escribir un **"parrafo"**: Un desarrollo EXTREMADAMENTE EXTENSO Y DETALLADO de al menos 500 a 600 palabras que explique con máxima profundidad la idea (H1) y su conexión con el "elementoApoyo". Es de vital importancia que el párrafo sea muy largo, rico en contenido, claro y pastoral.
    4.  Generar los **"imperativos"** finales del sermón.

    **Formato de Salida (JSON estricto para el objeto raíz):**
    {
      "introduction": { "presentacion": "...", "motivation": "..." },
      "imperatives": "...",
      "ideas": [
        { "h1": "${sermonStructure.ideas[0].h1}", "elementoApoyo": { "tipo": "...", "contenido": "..." }, "parrafo": "..." },
        { "h1": "${sermonStructure.ideas[1].h1}", "elementoApoyo": { "tipo": "...", "contenido": "..." }, "parrafo": "..." },
        { "h1": "${sermonStructure.ideas[2].h1}", "elementoApoyo": { "tipo": "...", "contenido": "..." }, "parrafo": "..." },
        { "h1": "${sermonStructure.ideas[3].h1}", "elementoApoyo": { "tipo": "...", "contenido": "..." }, "parrafo": "..." },
        { "h1": "${sermonStructure.ideas[4].h1}", "elementoApoyo": { "tipo": "...", "contenido": "..." }, "parrafo": "..." }
      ]
    }
  `;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = await response.text();
  try {
    return extractAndParseJson(text);
  } catch (e) {
    console.error("Error en Paso 2 (Contenido)", e);
    e.step = 2;
    throw e;
  }
}

async function generateSermonStep3_Triggers(idea, model) {
    const prompt = `
    ${masterPrompt}

    **Paso 3: Crear los Disparadores Mentales**

    **Idea Principal (H1):** "${idea.h1}"
    **Párrafo Explicativo:** "${idea.parrafo}"

    **Instrucción:**
    Lee el párrafo explicativo y crea **cuatro 'Disparadores Mentales'**. Cada disparador debe ser una frase muy corta (1-2 líneas) que resuma la esencia del párrafo y sirva como un recordatorio rápido.

    **Formato de Salida (JSON estricto para el array):**
    [
      { "disparador": "...", "parrafo": "..." },
      { "disparador": "...", "parrafo": "..." },
      { "disparador": "...", "parrafo": "..." },
      { "disparador": "...", "parrafo": "..." }
    ]
  `;
  // Note: The prompt asks for the "parrafo" to be returned as well, but we will only use the "disparador" part.
  // This is to maintain a consistent structure that the AI is good at generating.
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = await response.text();
  try {
    // We only need the disparador text, but the AI generates both. We will extract what we need.
    const generatedDisparadores = extractAndParseJson(text);
    // We need to split the original long paragraph into smaller ones to associate with each trigger.
    // This is a simplification; a more advanced version could ask the AI to generate the paragraphs too.
    const sentences = idea.parrafo.match(/[^.!?]+[.!?]+/g) || [idea.parrafo];
    const numDisparadores = generatedDisparadores.length;
    const sentencesPerDisparador = Math.ceil(sentences.length / numDisparadores);

    return generatedDisparadores.map((disp, index) => {
        const start = index * sentencesPerDisparador;
        const end = start + sentencesPerDisparador;
        const parrafoSlice = sentences.slice(start, end).join(' ').trim();
        return {
            disparador: disp.disparador,
            parrafo: parrafoSlice || disp.parrafo // Fallback to AI-generated paragraph if slicing fails
        };
    });

  } catch (e) {
    console.error(`Error en Paso 3 (Disparadores) para la idea "${idea.h1}"`, e);
    // Return a fallback structure to avoid breaking the entire sermon generation
    return [
        { disparador: "Error al generar disparador 1", parrafo: idea.parrafo },
        { disparador: "Error al generar disparador 2", parrafo: "" },
    ];
  }
}


export async function generateSermon(topic = '', searchResults = {}, categories = [], liturgyContext = null) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  try {
    // **STEP 1: Get the core structure (Title and H1s)**
    console.log("Iniciando Paso 1: Estructura...");
    const structure = await generateSermonStep1_Structure(topic, searchResults, categories, model);
    console.log("Paso 1 completado:", structure);

    // **STEP 2: Get the main content (Introduction, Imperatives, Supporting Elements, Paragraphs)**
    console.log("Iniciando Paso 2: Contenido...");
    const content = await generateSermonStep2_Content(structure, topic, searchResults, categories, model);
    console.log("Paso 2 completado:", content);

    // Combine structure and content
    let sermon = {
      ...structure,
      ...content,
      ideas: structure.ideas.map(idea => {
        const contentIdea = content.ideas.find(ci => ci.h1 === idea.h1);
        return { ...idea, ...contentIdea };
      })
    };

    // **STEP 3: Get the mental triggers for each idea**
    console.log("Iniciando Paso 3: Disparadores...");
    const enrichedIdeas = await Promise.all(
      sermon.ideas.map(async (idea) => {
        const disparadores = await generateSermonStep3_Triggers(idea, model);
        return { ...idea, disparadores };
      })
    );
    console.log("Paso 3 completado para todas las ideas.");

    sermon.ideas = enrichedIdeas;

    // Clean up the final object, removing the temporary full paragraph
    sermon.ideas.forEach(idea => {
        delete idea.parrafo;
    });

    console.log("Sermón final ensamblado:", sermon);
    return sermon;

  } catch (err) {
    console.error('Error en la generación del sermón por pasos:', err);
    const step = err.step || 'desconocido';
    if (err.raw) {
      throw new Error(`La IA devolvió un formato inválido en el paso ${step}. Contenido: ${err.raw.substring(0, 200)}...`);
    }
    throw new Error(`Ocurrió un error en el paso ${step} de la generación del sermón.`);
  }
}