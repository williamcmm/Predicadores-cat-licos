import { getResourceSearchPrompt } from './prompts/resourceSearchPrompt.js';

class GeminiSearcher {
    constructor() {
        this.apiKey = process.env.REACT_APP_GEMINI_API_KEY;
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    }

    async _callGeminiAPI(prompt, isJson = false) {
        const generationConfig = {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192, // Aumentado para prompts más largos
            ...(isJson && { responseMimeType: "application/json" })
        };

        try {
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig }),
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'No se pudo leer el cuerpo del error.');
                throw new Error(`Error en la API de Gemini. Estado: ${response.status} - ${errorText}`);
            }

            return await response.json();

        } catch (error) {
            console.error('Error en la llamada a Gemini:', error);
            throw error;
        }
    }

    async searchForContent(topic) {
        const prompt = getResourceSearchPrompt(topic);

        const data = await this._callGeminiAPI(prompt);
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            return this._formatContentResponse(data.candidates[0].content.parts[0].text);
        }
        throw new Error('No se pudo obtener el contenido para el sermón.');
    }

    async generateSermonFromTopic(topic, messageType = 'Catequesis') {
        const resources = await this.searchForContent(topic);

        const masterPrompt = `
            Actúa como un asistente experto en homilética católica, con un estilo pastoral, cercano y amable.
            Tu misión es ayudar a un predicador a preparar un sermón memorable y transformador.

            **Tema del Sermón:** ${topic}
            **Tipo de Mensaje Deseado:** ${messageType}

            **Banco de Recursos Disponibles (en formato JSON):**
            ${JSON.stringify(resources, null, 2)}

            **Instrucciones Detalladas:**
            1.  **Genera un Borrador de Sermón Completo:** Usando los recursos provistos, crea un sermón coherente y bien estructurado.
            2.  **Selección Inteligente:** Para cada campo del sermón, selecciona el MEJOR recurso de la categoría correspondiente en el banco de recursos. No te limites a copiar; adapta el recurso para que fluya naturalmente en el sermón.
            3.  **Estructura de Salida:** Debes responder con un ÚNICO objeto JSON válido, sin comentarios, markdown, ni texto adicional. El JSON debe seguir esta estructura exacta:
                {
                    "titulo": "<string: Título principal del sermón>",
                    "introduccion": {
                        "presentacionTema": "<string>",
                        "motivacionInicial": "<string>"
                    },
                    "ideas": [
                        {
                            "titulo": "<string: Título de la Idea Principal (H1)>",
                            "elementoDeApoyo": {
                                "tipo": "<string: 'Cita Bíblica', 'Catecismo', 'Otro'>",
                                "texto": "<string: El contenido de la cita o texto de apoyo. Opcional.>
                            },
                            "puntosDeDesarrollo": [
                                {
                                    "contenido": "<string: El párrafo grande y detallado que explica este punto>",
                                    "disparador": "<string: La frase corta y memorable que resume el párrafo anterior>"
                                }
                            ]
                        }
                    ],
                    "imperativos": "<string>",
                    "conclusion": {
                        "resumen": "<string>",
                        "fraseClave": "<string>"
                    }
                }
            4.  **Reglas de Contenido:**
                - **Ideas Principales:** Genera entre 4 y 6 objetos en el array "ideas". Cada objeto representa una sección principal (H1) del sermón.
                - **Puntos de Desarrollo:** Dentro de cada idea, genera entre 3 y 4 objetos en el array "puntosDeDesarrollo".
                - **Vinculación:** El campo "disparador" DEBE ser un resumen directo y conciso del campo "contenido" dentro del mismo objeto.
            5.  **Estilo y Tono:** Escribe en un lenguaje contemporáneo pero respetuoso. El tono debe ser pastoral y cercano.
            6.  **Reglas Teológicas:** Respeta todas las reglas del prompt original (Biblia DHH, no "Jehová", etc.).

            Ahora, genera el objeto JSON del sermón.
        `;

        const data = await this._callGeminiAPI(masterPrompt, true);

        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            try {
                const sermonText = data.candidates[0].content.parts[0].text;
                const cleanJson = sermonText.replace(/^```json\n|\n```$/g, '');
                return JSON.parse(cleanJson);
            } catch (e) {
                console.error("Error al parsear el JSON del sermón generado:", e);
                throw new Error("La IA no devolvió un formato de sermón válido.");
            }
        }
        throw new Error('No se pudo generar el borrador del sermón.');
    }

    async suggestIdeaTitles(topic, resources) {
        const prompt = `
            Basado en el tema "${topic}" y el siguiente banco de recursos JSON, sugiere entre 4 y 5 títulos para las ideas principales de un sermón.
            Los títulos deben ser concisos, atractivos y reflejar los puntos clave encontrados en los recursos.
            Responde únicamente con un objeto JSON que contenga un array de strings llamado "titulos".
            Ejemplo de respuesta: {"titulos": ["Título de la Idea 1", "Título de la Idea 2", "Título de la Idea 3", "Título de la Idea 4"]}

            Banco de Recursos:
            ${JSON.stringify(resources, null, 2)}
        `;

        const data = await this._callGeminiAPI(prompt, true); // true for JSON output

        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            try {
                const responseText = data.candidates[0].content.parts[0].text;
                const parsed = JSON.parse(responseText);
                if (Array.isArray(parsed.titulos)) {
                    return parsed.titulos;
                }
                throw new Error("La respuesta de la IA no contiene un array de 'titulos'.");
            } catch (e) {
                console.error("Error al parsear los títulos de ideas generados:", e);
                throw new Error("La IA no devolvió un formato de títulos válido.");
            }
        }
        throw new Error('No se pudieron generar los títulos de las ideas.');
    }

    async generateRandomSermonTopics() {
        const prompt = `Genera una lista de 10 temas diversos y atractivos para sermones católicos. 
        Responde únicamente con la lista de temas, uno por línea, sin numeración ni guiones.`;
        
        const data = await this._callGeminiAPI(prompt);
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            const text = data.candidates[0].content.parts[0].text;
            return text.split('\n').map(t => t.replace(/^[*-]\s*/, '').trim()).filter(t => t);
        }
        throw new Error('No se pudieron generar temas de sermón.');
    }

    _formatContentResponse(text) {
        const resultados = {};
        const categorias = [
            "DOCTRINA CATÓLICA", "CATECISMO", "SANTORAL CATÓLICO", "CITAS BÍBLICAS RELEVANTES",
            "REFLEXIONES SOBRE EL TEMA", "EJEMPLOS PRÁCTICOS", "TESTIMONIOS Y EXPERIENCIAS",
            "DATOS CIENTÍFICOS/HISTÓRICOS", "DOCUMENTOS OFICIALES DE LA IGLESIA"
        ];
        let categoriaActual = null;
        const lineas = text.split('\n').filter(linea => linea.trim() !== '');

        lineas.forEach(linea => {
            const categoriaEncontrada = categorias.find(cat => linea.toUpperCase().includes(cat));
            if (categoriaEncontrada) {
                categoriaActual = categoriaEncontrada;
                if (!resultados[categoriaActual]) resultados[categoriaActual] = [];
            } else if (categoriaActual) {
                let textoLimpio = linea.replace(/^[*#-]+\s*/, '').trim();
                if (textoLimpio) {
                    textoLimpio = textoLimpio.replace(/Jehová/gi, 'Señor');
                    resultados[categoriaActual].push({ texto: textoLimpio, fuente: null });
                }
            }
        });
        return resultados;
    }
}

export default GeminiSearcher;
