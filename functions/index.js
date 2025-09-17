const {onCall} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");
const logger = require("firebase-functions/logger");

// Definir el secret
const superAdminsSecret = defineSecret("VITE_SUPER_ADMINS");

// Función onCall - Firebase maneja CORS automáticamente
exports.getConfig = onCall({
  secrets: [superAdminsSecret],
}, async (request) => {
  try {
    // Obtener el valor del secret
    const secretValue = superAdminsSecret.value();
    const superAdminEmails = secretValue ?
      secretValue.split(",").map((email) => email.trim()) :
      [];

    logger.info("Super admins desde secret:", superAdminEmails);

    return {
      superAdminEmails: superAdminEmails,
      timestamp: new Date().toISOString(),
      source: "firebase-secret",
    };
  } catch (error) {
    logger.error("Error obteniendo configuración:", error);
    throw new Error("Error interno del servidor");
  }
});
