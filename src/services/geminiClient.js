// WARNING: This client example is for local testing only. Do NOT use in production.
// It reads the API key from process.env.REACT_APP_GEMINI_API_KEY and calls the Generative API directly.

export async function generateText(prompt) {
  const key = process.env.REACT_APP_GEMINI_API_KEY;
  if (!key) throw new Error('REACT_APP_GEMINI_API_KEY is not set in environment');

  const model = 'models/text-bison-001'; // adjust model name if needed
  const url = `https://generativelanguage.googleapis.com/v1/${model}:generate?key=${key}`;

  const body = {
    prompt: { text: prompt },
    temperature: 0.7,
    maxOutputTokens: 512,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Generative API error: ${res.status} ${text}`);
  }

  return res.json();
}
