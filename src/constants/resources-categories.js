export const PERSONAL_RESOURCE_CATEGORY = "RECURSOS PERSONALES";

export const INITIAL_CATEGORIES = [
  "CITAS BÍBLICAS RELEVANTES",
  "DOCTRINA CATÓLICA",
  "CATECISMO",
  "SANTORAL CATÓLICO",
  "REFLEXIONES SOBRE EL TEMA",
  "EJEMPLOS PRÁCTICOS",
  "TESTIMONIOS Y EXPERIENCIAS",
  "DATOS CIENTÍFICOS/HISTÓRICOS",
  "REFERENCIAS DOCTRINALES",
  "DOCUMENTOS OFICIALES DE LA IGLESIA",
  PERSONAL_RESOURCE_CATEGORY,
].map((name) => {
  const category = {
    name,
    active: false,
  };

  // Categorias activas por defecto
  if (name === "CITAS BÍBLICAS RELEVANTES") category.active = true;

  return category;
});