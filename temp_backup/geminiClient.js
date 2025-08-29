// WARNING: This client example is for local testing only. Do NOT use in production.
// It reads the API key from process.env.REACT_APP_GEMINI_API_KEY and calls the Gemini API directly.

export async function generateText(prompt) {
  const key = process.env.REACT_APP_GEMINI_API_KEY;
  if (!key) throw new Error('REACT_APP_GEMINI_API_KEY is not set in environment');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

  const body = {
    contents: [{
      parts: [{
        text: `Actúa como un teólogo católico experto en homilética. ${prompt}
        
        Proporciona una respuesta estructurada que incluya:
        - Referencias bíblicas apropiadas
        - Enseñanzas del Magisterio de la Iglesia Católica cuando sea relevante
        - Aplicaciones prácticas para la vida cristiana
        - Estructura clara para un sermón o homilía
        
        Usa la Biblia Dios Habla Hoy con deuterocanónicos como referencia bíblica preferida.`
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      }
    ]
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${text}`);
  }

  const data = await res.json();
  
  // Extraer el texto de la respuesta
  if (data.candidates && data.candidates[0] && data.candidates[0].content) {
    return {
      text: data.candidates[0].content.parts[0].text
    };
  } else {
    throw new Error('Respuesta inesperada de la API de Gemini');
  }
}