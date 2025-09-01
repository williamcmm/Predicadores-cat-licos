const functions = require("firebase-functions");
const {google} = require("googleapis");

// TODO: Reemplaza esta cadena con la ID de tu canal de YouTube.
const YOUTUBE_CHANNEL_ID = "ID_DE_TU_CANAL_DE_YOUTUBE";

// Inicializa el cliente de OAuth2
const oauth2Client = new google.auth.OAuth2(
    functions.config().google.client_id,
    functions.config().google.client_secret
);

/**
 * Cloud Function para verificar el nivel de membresía de un usuario en un canal de YouTube.
 * Es una función "callable", lo que significa que se llama directamente desde la app.
 */
exports.checkYouTubeMembership = functions.https.onCall(async (data, context) => {
  // 1. Asegurarse de que el usuario esté autenticado en Firebase.
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "La función debe ser llamada por un usuario autenticado.",
    );
  }

  // 2. El token de acceso del usuario se debe pasar en el cuerpo de la llamada.
  const accessToken = data.accessToken;
  if (!accessToken) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "La función debe ser llamada con un 'accessToken'.",
    );
  }

  // 3. Configurar las credenciales del cliente de OAuth2 con el token del usuario.
  oauth2Client.setCredentials({access_token: accessToken});

  // 4. Crear una instancia del cliente de la API de YouTube.
  const youtube = google.youtube({version: "v3", auth: oauth2Client});

  try {
    // 5. Llamar a la API de YouTube para obtener las membresías del usuario.
    const response = await youtube.memberships.list({
      part: "snippet",
    });

    const memberships = response.data.items;

    if (!memberships || memberships.length === 0) {
      console.log("El usuario no tiene membresías activas.");
      return {membershipLevel: null};
    }

    // 6. Buscar si alguna de las membresías corresponde a nuestro canal.
    const mainChannelMembership = memberships.find(
        (membership) =>
          membership.snippet.channelId === YOUTUBE_CHANNEL_ID,
    );

    if (mainChannelMembership) {
      // 7. Si se encuentra la membresía, devolver el nivel.
      const levelName = mainChannelMembership.snippet.membershipsDetails.highestLevelDisplayName;
      console.log(`Usuario es miembro. Nivel: ${levelName}`);
      return {membershipLevel: levelName};
    } else {
      // 8. Si no se encuentra, el usuario no es miembro de este canal.
      console.log("Usuario suscrito a otros canales, pero no a este.");
      return {membershipLevel: null};
    }
  } catch (error) {
    // Manejar errores de la API de YouTube.
    console.error("Error al llamar a la API de YouTube:", error.message);
    if (error.code === 403) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "El usuario no ha otorgado los permisos de YouTube necesarios.",
            error.message
        );
    }
    throw new functions.https.HttpsError(
        "internal",
        "Ocurrió un error al verificar la membresía.",
        error.message
    );
  }
});