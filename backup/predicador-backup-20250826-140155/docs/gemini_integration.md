# Integración de Gemini (Generative AI) - Guía rápida

Este documento resume cómo integrar la clave de Gemini de forma segura y cómo probar la integración localmente.

## Opciones

- **Desarrollo rápido (NO usar en producción):** usar `REACT_APP_GEMINI_API_KEY` en `.env` y llamar directamente desde `src/services/geminiClient.js`.
- **Producción (recomendado):** crear un backend que almacene la clave en `process.env.GEMINI_API_KEY` o en Secret Manager, y exponga un endpoint `/api/generate`.

## Archivos añadidos

- `.env.example` - plantilla con variable `REACT_APP_GEMINI_API_KEY`.
- `src/services/geminiClient.js` - cliente de prueba para llamadas directas (solo testing local).
- `server/index.js` - servidor Express de ejemplo que actúa como proxy seguro.

## Pasos para pruebas locales (rápido)
1. Copia tu clave a `.env` en la raíz:
   - `REACT_APP_GEMINI_API_KEY=TU_API_KEY_AQUI`
2. Reinicia el servidor de desarrollo (CRA):
   - `Stop-Process -Name node -ErrorAction SilentlyContinue` y `npm start`
3. En la app, llama a `generateText(prompt)` desde `src/services/geminiClient.js` para probar.

## Ejecutar el servidor proxy local (recomendado)
1. Instala dependencias del servidor:
   - `cd server` y `npm init -y` luego `npm install express node-fetch dotenv`
2. Crea `.env` en la carpeta `server` con `GEMINI_API_KEY=TU_API_KEY_AQUI` (esta clave no irá al cliente)
3. Ejecuta `node index.js` en la carpeta `server` y luego llama a `/api/generate` desde la app React.

## Notas de seguridad
- No subas `.env` a git. `.gitignore` ya contiene `.env`.
- Restringe la API key en Google Cloud (HTTP referrers o IPs) y usa Secret Manager para producción.
