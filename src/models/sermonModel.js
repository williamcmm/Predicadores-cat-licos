/**
 * Modelo centralizado para la estructura de datos de sermones
 * Contiene todas las funciones para crear, validar y manipular sermones
 */

// ================================
// FUNCIONES DE CREACIÓN
// ================================

/**
 * Crea un sermón vacío con la estructura base
 * @returns {Object} Sermón vacío con todos los campos inicializados
 */
export function getEmptySermon() {
  return {
    title: "",
    introduction: {
      presentation: "",
      motivation: "",
    },
    ideas: [],
    imperatives: "",
  };
}

/**
 * Crea una idea vacía con la estructura completa
 * @returns {Object} Idea vacía con todos los campos inicializados
 */
export function getEmptyIdea() {
  const timestamp = Date.now();
  return {
    id: `idea_${timestamp}`,
    h1: "",
    lineaInicial: "",
    elementoApoyo: {
      id: `elemento_apoyo_${Date.now()}`,
      tipo: "cita_biblica",
      contenido: "",
    },
    disparadores: [getEmptyDisparador()],
    ejemploPractico: "",
    resultadoEsperado: "",
  };
}

/**
 * Crea un disparador vacío con la estructura base
 * @returns {Object} Disparador vacío
 */
export function getEmptyDisparador() {
  return {
    id: `disparador_${Date.now()}`,
    disparador: "",
    parrafo: "",
    elementosApoyo: [], // Array de elementos de apoyo (máximo 3)
  };
}

/**
 * Crea un elemento de apoyo vacío para disparadores
 * @returns {Object} Elemento de apoyo vacío
 */
export function getEmptyElementoApoyo() {
  return {
    id: `elemento_apoyo_${Date.now()}`,
    tipo: "cita_biblica",
    contenido: "",
  };
}

// ================================
// FUNCIONES DE VALIDACIÓN
// ================================

/**
 * Valida que un sermón tenga la estructura correcta
 */
export function validateSermonStructure(sermon) {
  const errors = [];

  if (!sermon || typeof sermon !== "object") {
    errors.push("El sermón debe ser un objeto válido");
    return errors;
  }

  // Validar campos requeridos del sermón
  if (typeof sermon.title !== "string") {
    errors.push('El campo "title" debe ser una cadena de texto');
  }

  if (typeof sermon.imperatives !== "string") {
    errors.push('El campo "imperatives" debe ser una cadena de texto');
  }

  // Validar introducción
  if (!sermon.introduction || typeof sermon.introduction !== "object") {
    errors.push('El campo "introduction" debe ser un objeto');
  } else {
    if (typeof sermon.introduction.presentation !== "string") {
      errors.push(
        'El campo "introduction.presentation" debe ser una cadena de texto'
      );
    }
    if (typeof sermon.introduction.motivation !== "string") {
      errors.push(
        'El campo "introduction.motivation" debe ser una cadena de texto'
      );
    }
  }

  // Validar ideas
  if (!Array.isArray(sermon.ideas)) {
    errors.push('El campo "ideas" debe ser un array');
  } else {
    sermon.ideas.forEach((idea, index) => {
      const ideaErrors = validateIdeaStructure(idea);
      ideaErrors.forEach((error) => {
        errors.push(`Idea ${index + 1}: ${error}`);
      });
    });
  }

  return errors;
}

/**
 * Valida que una idea tenga la estructura correcta
 */
export function validateIdeaStructure(idea) {
  const errors = [];

  if (!idea || typeof idea !== "object") {
    errors.push("La idea debe ser un objeto válido");
    return errors;
  }

  // Validar campos requeridos de la idea
  const requiredStringFields = [
    "id",
    "h1",
    "lineaInicial",
    "ejemploPractico",
    "resultadoEsperado",
  ];
  requiredStringFields.forEach((field) => {
    if (typeof idea[field] !== "string") {
      errors.push(`El campo "${field}" debe ser una cadena de texto`);
    }
  });

  // Validar elementoApoyo
  if (!idea.elementoApoyo || typeof idea.elementoApoyo !== "object") {
    errors.push('El campo "elementoApoyo" debe ser un objeto');
  } else {
    if (typeof idea.elementoApoyo.tipo !== "string") {
      errors.push('El campo "elementoApoyo.tipo" debe ser una cadena de texto');
    }
    if (typeof idea.elementoApoyo.contenido !== "string") {
      errors.push(
        'El campo "elementoApoyo.contenido" debe ser una cadena de texto'
      );
    }
  }

  // Validar disparadores
  if (!Array.isArray(idea.disparadores)) {
    errors.push('El campo "disparadores" debe ser un array');
  } else {
    idea.disparadores.forEach((disparador, index) => {
      const disparadorErrors = validateDisparadorStructure(disparador);
      disparadorErrors.forEach((error) => {
        errors.push(`Disparador ${index + 1}: ${error}`);
      });
    });
  }

  return errors;
}

/**
 * Valida la estructura de un disparador
 * @param {Object} disparador 
 * @returns {Boolean} true si es válido
 */
export function validateDisparadorStructure(disparador) {
  if (!disparador || typeof disparador !== 'object') return false;
  
  return (
    typeof disparador.id === 'string' &&
    typeof disparador.disparador === 'string' &&
    typeof disparador.parrafo === 'string' &&
    Array.isArray(disparador.elementosApoyo) &&
    disparador.elementosApoyo.length <= 3 && // Máximo 3 elementos
    disparador.elementosApoyo.every(validateElementoApoyoStructure)
  );
}

/**
 * Valida la estructura de un elemento de apoyo
 * @param {Object} elemento 
 * @returns {Boolean} true si es válido
 */
export function validateElementoApoyoStructure(elemento) {
  if (!elemento || typeof elemento !== 'object') return false;
  
  return (
    typeof elemento.id === 'string' &&
    typeof elemento.tipo === 'string' &&
    typeof elemento.contenido === 'string'
  );
}

/**
 * Valida los campos de texto requeridos de un sermón
 * @param {Object} sermon 
 * @returns {Array} Array de errores encontrados
 */
export function validateRequiredFields(sermon) {
  const errors = [];
  const requiredFields = [
    'titulo', 'textoBase', 'fechaCreacion', 'fechaModificacion'
  ];

  requiredFields.forEach(field => {
    if (!sermon[field] || typeof sermon[field] !== 'string' || sermon[field].trim() === '') {
      errors.push(`El campo "${field}" es requerido y no puede estar vacío`);
    }
  });

  // Validar que las fechas sean válidas
  ['fechaCreacion', 'fechaModificacion'].forEach(field => {
    if (sermon[field] && isNaN(new Date(sermon[field]).getTime())) {
      errors.push(`El campo "${field}" debe ser una fecha válida`);
    }
  });

  // Validar campos de texto específicos
  const textFields = ['lineaInicial', 'ejemploPractico', 'resultadoEsperado'];
  textFields.forEach(field => {
    if (sermon[field] && typeof sermon[field] !== 'string') {
      errors.push(`El campo "${field}" debe ser una cadena de texto`);
    }
  });

  return errors;
}

// ================================
// FUNCIONES DE MANIPULACIÓN
// ================================

/**
 * Combina datos de sermón nuevos con la estructura base
 * Útil para procesar datos de la IA o imports
 * @param {Object} newData - Datos nuevos del sermón
 * @param {Object} baseSermon - Sermón base (opcional, usa estructura vacía por defecto)
 * @returns {Object} Sermón con estructura completa y datos combinados
 */
export function mergeSermonData(newData, baseSermon = null) {
  if (!newData || typeof newData !== "object") {
    return getEmptySermon();
  }

  const base = baseSermon || getEmptySermon();

  return {
    ...base,
    ...newData,
    // Combinar introducción de forma segura
    introduction: {
      ...base.introduction,
      ...(newData.introduction || {}),
    },
    // Procesar ideas para asegurar estructura completa
    ideas: (newData.ideas || []).map((idea, index) => {
      const baseIdea = getEmptyIdea();
      return {
        ...baseIdea,
        ...idea,
        id: idea.id || `idea_${Date.now() + index}`,
        // Combinar elementoApoyo de forma segura
        elementoApoyo: {
          ...baseIdea.elementoApoyo,
          ...(idea.elementoApoyo || {}),
        },
        // Procesar disparadores para asegurar estructura completa
        disparadores: (idea.disparadores || []).map((disparador, dIndex) => {
          const baseDisparador = getEmptyDisparador();
          return {
            ...baseDisparador,
            ...disparador,
            id: disparador.id || `disparador_${Date.now() + index + dIndex}`,
            // Procesar elementos de apoyo del disparador
            elementosApoyo: (disparador.elementosApoyo || []).map((elemento, eIndex) => {
              const baseElemento = getEmptyElementoApoyo();
              return {
                ...baseElemento,
                ...elemento,
                id: elemento.id || `elemento_apoyo_${Date.now() + index + dIndex + eIndex}`,
              };
            }),
          };
        }),
      };
    }),
  };
}

/**
 * Normaliza un sermón para asegurar que tenga la estructura correcta
 * Útil para sermones que vienen de fuentes externas o versiones antiguas
 * @param {Object} sermon - Sermón a normalizar
 * @returns {Object} Sermón normalizado con estructura completa
 */
export function normalizeSermon(sermon) {
  if (!sermon || typeof sermon !== "object") {
    return getEmptySermon();
  }

  const normalized = mergeSermonData(sermon);

  // Asegurar que cada idea tenga al menos un disparador
  normalized.ideas = normalized.ideas.map((idea) => ({
    ...idea,
    disparadores:
      idea.disparadores.length > 0 ? idea.disparadores : [getEmptyDisparador()],
  }));

  return normalized;
}

/**
 * Clona profundamente un sermón
 * Útil para evitar mutaciones accidentales
 * @param {Object} sermon - Sermón a clonar
 * @returns {Object} Copia profunda del sermón
 */
export function cloneSermon(sermon) {
  return JSON.parse(JSON.stringify(sermon));
}

// ================================
// FUNCIONES DE UTILIDAD
// ================================

/**
 * Genera un ID único para elementos del sermón
 * @param {string} prefix - Prefijo para el ID (ej: 'idea', 'disparador')
 * @returns {string} ID único
 */
export function generateId(prefix = "item") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Verifica si un sermón está vacío (sin contenido)
 * @param {Object} sermon - Sermón a verificar
 * @returns {boolean} true si está vacío, false si tiene contenido
 */
export function isSermonEmpty(sermon) {
  if (!sermon) return true;

  return (
    !sermon.title.trim() &&
    !sermon.introduction?.presentation?.trim() &&
    !sermon.introduction?.motivation?.trim() &&
    sermon.ideas.length === 0 &&
    !sermon.imperatives?.trim()
  );
}

/**
 * Cuenta las palabras totales del sermón
 * @param {Object} sermon - Sermón a contar
 * @returns {number} Número total de palabras
 */
export function countSermonWords(sermon) {
  if (!sermon) return 0;

  let wordCount = 0;

  // Contar palabras del título
  wordCount += (sermon.title || "")
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  // Contar palabras de la introducción
  wordCount += (sermon.introduction?.presentation || "")
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  wordCount += (sermon.introduction?.motivation || "")
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  // Contar palabras de las ideas
  sermon.ideas?.forEach((idea) => {
    wordCount += (idea.h1 || "")
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    wordCount += (idea.lineaInicial || "")
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    wordCount += (idea.elementoApoyo?.contenido || "")
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    wordCount += (idea.ejemploPractico || "")
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    wordCount += (idea.resultadoEsperado || "")
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;

    idea.disparadores?.forEach((disparador) => {
      wordCount += (disparador.disparador || "")
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
      wordCount += (disparador.parrafo || "")
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
    });
  });

  // Contar palabras de los imperativos
  wordCount += (sermon.imperatives || "")
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  return wordCount;
}

// ================================
// CONSTANTES Y CONFIGURACIÓN
// ================================

/**
 * Tipos de elementos de apoyo disponibles
 */
export const ELEMENTO_APOYO_TIPOS = {
  CITA_BIBLICA: "cita_biblica",
  MAGISTERIO: "magisterio",
  TESTIMONIO: "testimonio",
  ANALOGIA: "analogia",
  ESTADISTICA: "estadistica",
  HISTORIA: "historia",
};

/**
 * Límites y configuraciones
 */
export const SERMON_LIMITS = {
  MAX_DISPARADORES_POR_IDEA: 8,
  MIN_DISPARADORES_POR_IDEA: 1,
  MAX_IDEAS_RECOMENDADAS: 5,
  MIN_IDEAS_RECOMENDADAS: 2,
};

/**
 * Plantillas de sermón por tipo
 */
export const SERMON_TEMPLATES = {
  homilia: {
    title: "Homilía Dominical",
    type: "Homilía",
  },
  catequesis: {
    title: "Catequesis",
    type: "Catequesis",
  },
  retiro: {
    title: "Conferencia de Retiro",
    type: "Retiro",
  },
};
