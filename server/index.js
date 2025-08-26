// Simple Express server to proxy requests to Gemini safely (example)
// Run: npm install express node-fetch dotenv

import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) console.warn('Warning: GEMINI_API_KEY not set. Configure it in the server environment.');

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    const model = 'models/text-bison-001';
    const url = `https://generativelanguage.googleapis.com/v1/${model}:generate?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: { text: prompt }, temperature: 0.7, maxOutputTokens: 512 }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server listening on ${port}`));
