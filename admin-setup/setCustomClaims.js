const admin = require("firebase-admin");

// Inicializar Firebase Admin SDK con configuración simplificada
const serviceAccount = require("./predicadores-catolicos-firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "predicadores-catolicos",
});

async function setCustomClaims() {
  try {
    // Email del usuario
    const email = "william.comunidad@gmail.com";

    // Buscar usuario por email
    const userRecord = await admin.auth().getUserByEmail(email);

    // Configurar custom claims
    const customClaims = {
      role: "super_admin",
    };

    await admin.auth().setCustomUserClaims(userRecord.uid, customClaims);

  } catch (error) {
    console.error("❌ Error configurando custom claims:", error.message);

    if (error.code === "auth/user-not-found") {
      console.error(
        "Usuario no encontrado. Verifica que el email sea correcto."
      );
    }
    if (error.code === "auth/invalid-credential") {
      console.error("Credenciales inválidas. Verifica el archivo de servicio.");
    }
    if (error.message.includes("PERMISSION_DENIED")) {
      console.error(
        "\n🔧 SOLUCIÓN: Necesitas habilitar la Identity and Access Management (IAM) API"
      );
      console.error(
        "Ve a: https://console.cloud.google.com/apis/enableflow?apiid=iam.googleapis.com&project=predicadores-catolicos"
      );
      console.error(
        'Haz clic en "ENABLE" y luego ejecuta este script nuevamente.'
      );
    }
  }

  process.exit();
}

setCustomClaims();
