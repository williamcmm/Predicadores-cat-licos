const admin = require('firebase-admin');

// Inicializar Firebase Admin SDK con configuración simplificada
const serviceAccount = require('./predicadores-catolicos-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'predicadores-catolicos'
});

async function setCustomClaims() {
  try {
    console.log('Intentando configurar custom claims...');
    
    // Email del usuario
    const email = 'william.comunidad@gmail.com';
    console.log(`Buscando usuario: ${email}`);
    
    // Buscar usuario por email
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log(`✅ Usuario encontrado: ${userRecord.email} (UID: ${userRecord.uid})`);
    
    // Configurar custom claims
    const customClaims = {
      role: 'super_admin'
    };
    
    console.log('Configurando custom claims...');
    await admin.auth().setCustomUserClaims(userRecord.uid, customClaims);
    
    console.log('✅ Custom claims configurados exitosamente!');
    console.log('Configuración aplicada:', customClaims);
    console.log('\n🔄 El usuario debe cerrar sesión e iniciar sesión nuevamente para que los cambios surtan efecto.');
    
    // Verificar los claims
    const updatedUser = await admin.auth().getUser(userRecord.uid);
    console.log('\n📋 Claims actuales del usuario:', updatedUser.customClaims);
    
    console.log('\n✅ ¡Proceso completado! Ahora puedes:');
    console.log('1. Cerrar sesión en tu aplicación');
    console.log('2. Iniciar sesión nuevamente');
    console.log('3. Deberías ver "Panel de Administrador" en tu menú');
    
  } catch (error) {
    console.error('❌ Error configurando custom claims:', error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.error('Usuario no encontrado. Verifica que el email sea correcto.');
    }
    if (error.code === 'auth/invalid-credential') {
      console.error('Credenciales inválidas. Verifica el archivo de servicio.');
    }
    if (error.message.includes('PERMISSION_DENIED')) {
      console.error('\n🔧 SOLUCIÓN: Necesitas habilitar la Identity and Access Management (IAM) API');
      console.error('Ve a: https://console.cloud.google.com/apis/enableflow?apiid=iam.googleapis.com&project=predicadores-catolicos');
      console.error('Haz clic en "ENABLE" y luego ejecuta este script nuevamente.');
    }
  }
  
  process.exit();
}

setCustomClaims();
