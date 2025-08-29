# Configuración del Login con Google Firebase

## Pasos para configurar Firebase Authentication:

### 1. Configurar Firebase Console
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto o crea uno nuevo
3. Ve a **Authentication** → **Sign-in method**
4. Habilita **Google** como proveedor de autenticación
5. Ve a **Settings** → **Authorized domains** y asegúrate de que `localhost` esté incluido

### 2. Obtener configuración del proyecto
1. Ve a **Project settings** (ícono de engranaje)
2. En la pestaña **General**, busca la sección **Your apps**
3. Si no tienes una app web, haz clic en **Add app** → **Web**
4. Copia la configuración que aparece (firebaseConfig)

### 3. Configurar variables de entorno
1. Copia el archivo `.env.local.example` a `.env.local`:
   ```bash
   copy .env.local.example .env.local
   ```

2. Abre `.env.local` y reemplaza los valores con los de tu proyecto Firebase:
   ```
   REACT_APP_FIREBASE_API_KEY=tu_api_key_real
   REACT_APP_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=tu_project_id_real
   REACT_APP_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id_real
   REACT_APP_FIREBASE_APP_ID=tu_app_id_real
   ```

### 4. Reiniciar el servidor de desarrollo
```bash
npm start
```

## Solución de problemas comunes:

### Error: "auth/invalid-api-key"
- Verifica que el archivo `.env.local` existe y contiene las variables correctas
- Asegúrate de reiniciar el servidor después de modificar `.env.local`
- Verifica que la API Key sea correcta en Firebase Console

### Error: "auth/unauthorized-domain"
- En Firebase Console → Authentication → Settings → Authorized domains
- Añade `localhost` si no está presente

### Popup se cierra inmediatamente
- Revisa la consola del navegador para errores específicos
- Asegúrate de que Google Authentication esté habilitado en Firebase
- Verifica que el dominio esté autorizado

## Estructura actual implementada:
- ✅ Configuración Firebase con variables de entorno
- ✅ Servicio de autenticación con manejo de errores
- ✅ Botón de login en el header con estados visual
- ✅ Contexto de autenticación para toda la app
- ✅ Manejo de estados de carga y errores
