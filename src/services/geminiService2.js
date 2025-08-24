// Servicio para consultar la API de Gemini de Google

export async function consultarGemini(texto) {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  const body = {
    contents: [
      {
        parts: [
          { text: texto }
        ]
      }
    ]
  };

  const res = await fetch(endpoint + '?key=' + apiKey, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error('Error consultando Gemini');
  return await res.json();
}
