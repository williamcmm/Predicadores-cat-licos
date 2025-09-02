# Firebase Admin Setup

Este script configura los custom claims para usuarios super admin.

## Instrucciones

### 1. Descargar Credenciales de Servicio

1. Ve a [Firebase Console](https://console.firebase.google.com/project/predicadores-catolicos/settings/serviceaccounts/adminsdk)
2. Haz clic en **"Generate new private key"**
3. Descarga el archivo JSON
4. Renómbralo como `predicadores-catolicos-firebase-adminsdk.json`
5. Colócalo en esta carpeta (`admin-setup/`)

### 2. Instalar dependencias

```bash
cd admin-setup
npm install
```

### 3. Ejecutar script

```bash
npm run set-admin
```

### 4. Resultado esperado

Si todo funciona correctamente, verás:

```
Usuario encontrado: william.comunidad@gmail.com (UID: 8nEgD4794hWJFf6iDrFtfSShsEI3)
✅ Custom claims configurados exitosamente!
Configuración aplicada: { role: 'super_admin', adminLevel: 'full' }
🔄 El usuario debe cerrar sesión e iniciar sesión nuevamente para que los cambios surtan efecto.
📋 Claims actuales del usuario: { role: 'super_admin', adminLevel: 'full' }
```

### 5. Probar en la aplicación

1. Cierra sesión en la aplicación
2. Inicia sesión nuevamente
3. Los logs de debugging deberían mostrar: `UserRole extraído: super_admin`
4. El botón "Panel de Administrador" debería aparecer en el menú

## Troubleshooting

- Si obtienes error de credenciales, verifica que el archivo JSON esté en la carpeta correcta
- Si el usuario no se encuentra, verifica el email en el script
- El archivo JSON debe tener permisos de administrador del proyecto
