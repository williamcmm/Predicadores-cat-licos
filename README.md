# Predicadores Católicos 🕊️

**Plataforma integral para la creación, gestión y estudio de sermones católicos con IA integrada**

## 🌟 **Características Principales**

### **🔐 Sistema de Autenticación y Permisos**
- **Autenticación OAuth** con Google
- **Sistema de membresías escalonado** (Básico, Intermedio, Avanzado, Administrador)
- **Panel de administración** para gestión de usuarios
- **Control de acceso granular** por funcionalidad

### **✍️ Editor de Sermones Inteligente**
- **3 Modos de trabajo**: Edición, Estudio, Predicación
- **IA integrada** para sugerencias y mejoras
- **Guardado automático** y manual
- **Estructura organizada** con introducción, ideas principales y conclusión

### **📚 Biblioteca Compartida**
- **Biblioteca personal** para guardar sermones
- **Sermones compartidos** de la comunidad
- **Sermón del día** con contenido curado
- **Sistema de duplicación** y personalización

### **⚡ Funcionalidades Avanzadas**
- **Búsqueda inteligente** en recursos bíblicos
- **Interface responsiva** para escritorio y móvil
- **Modo oscuro** y personalización de UI
- **Integración con Gemini AI** para asistencia

---

## 🔐 **Sistema de Permisos**

### **Niveles de Membresía:**

| Nivel | Nombre | Permisos |
|-------|--------|----------|
| **0** | Básico | Crear y editar sermones |
| **1** | Intermedio | + Guardar sermones, biblioteca personal |
| **2** | Avanzado | + Biblioteca compartida, sermones CMM |
| **3** | Premium | + Chat en vivo, funciones premium |
| **Admin** | Super Admin | + Panel de administración |

### **Características de Seguridad:**
- ✅ Firebase Custom Claims para roles
- ✅ Validación frontend y backend
- ✅ Controles de UI dinámicos
- ✅ Mensajes informativos de acceso

---

## 🚀 **Instalación y Configuración**

### **Requisitos Previos**
```bash
node >= 14.0.0
npm >= 6.0.0
Firebase Project configurado
```

### **Instalación**
```bash
# Clonar el repositorio
git clone https://github.com/williamcmm/Predicadores-catolicos.git
cd Predicadores-catolicos

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Firebase
```

### **Configuración Firebase**
1. Crear proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilitar Authentication (Google OAuth)
3. Crear base de datos Firestore
4. Configurar las variables en `.env.local`

---

## 🎯 **Scripts Disponibles**

### **Desarrollo**
```bash
npm start          # Servidor de desarrollo (localhost:3000)
npm test           # Ejecutar tests
npm run build      # Build para producción
```

### **Firebase**
```bash
firebase serve     # Servir localmente con Firebase
firebase deploy    # Desplegar a producción
```

### **Administración**
```bash
cd admin-setup
npm install
npm run set-admin  # Configurar super admin (requiere permisos)
```

---

## 📁 **Estructura del Proyecto**

```
src/
├── components/          # Componentes React
│   ├── admin/          # Panel de administración
│   ├── auth/           # Componentes de autenticación
│   ├── biblioteca/     # Biblioteca de sermones
│   ├── sermon/         # Editor y gestión de sermones
│   └── ui/             # Componentes de interfaz
├── context/            # Context providers (Auth, etc)
├── hooks/              # Custom hooks (useAccessControl)
├── services/           # Servicios (Firebase, AI, Storage)
└── config/             # Configuración (Firebase)

admin-setup/            # Scripts de administración
public/                 # Archivos estáticos
build/                  # Build de producción
```

---

## 🛡️ **Seguridad y Permisos**

### **Autenticación**
- **Firebase Auth** con Google OAuth
- **Custom Claims** para roles avanzados
- **Gestión de sesiones** segura

### **Autorización**
- **Control de acceso** por componente
- **Validación dual** frontend/backend
- **Mensajes informativos** para restricciones

**Ver documentación completa**: [`SISTEMA_AUTENTICACION_PERMISOS.md`](./SISTEMA_AUTENTICACION_PERMISOS.md)

---

## 🤖 **Integración con IA**

### **Gemini AI**
- **Sugerencias inteligentes** para contenido
- **Mejoras de redacción** automáticas
- **Búsqueda semántica** en recursos
- **Asistencia contextual** por modo

### **Configuración**
```javascript
// Configurar API key de Gemini en .env.local
REACT_APP_GEMINI_API_KEY=tu_api_key_aquí
```

---

## 📊 **Base de Datos**

### **Firestore Collections**

#### **users**
```javascript
{
  uid: string,           // Firebase UID
  email: string,         // Email
  displayName: string,   // Nombre
  userLevel: string,     // Nivel de membresía
  createdAt: timestamp,  // Fecha creación
  lastLogin: timestamp   // Último acceso
}
```

#### **sermones**
```javascript
{
  userId: string,        // Propietario
  title: string,         // Título
  introduction: string,  // Introducción
  mainIdeas: array,      // Ideas principales
  conclusion: string,    // Conclusión
  tags: array,          // Etiquetas
  createdAt: timestamp  // Fecha creación
}
```

---

## 🚀 **Deployment**

### **Firebase Hosting**
```bash
npm run build
firebase deploy
```

### **Configuración de Producción**
1. Configurar Firebase Security Rules
2. Habilitar APIs necesarias en Google Cloud
3. Configurar custom claims para administradores
4. Optimizar build para producción

---

## 🧪 **Testing**

```bash
npm test                    # Tests unitarios
npm test -- --coverage     # Con coverage
```

### **Estructura de Tests**
- **Componentes**: Tests de renderizado y interacción
- **Hooks**: Tests de lógica de negocio
- **Services**: Tests de integración con APIs

---

## 🤝 **Contribución**

### **Guía de Contribución**
1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### **Estándares de Código**
- **ESLint** para JavaScript/React
- **Prettier** para formateo
- **Conventional Commits** para mensajes

---

## 📝 **Changelog**

### **v1.0.0 - Sistema de Autenticación Completo**
- ✅ Sistema de permisos escalonados
- ✅ Panel de administración
- ✅ Autenticación OAuth con Google
- ✅ Control de acceso granular
- ✅ Interface responsiva mejorada

### **v0.9.0 - Editor Inteligente**
- ✅ 3 modos de trabajo
- ✅ Integración con Gemini AI
- ✅ Sistema de guardado automático
- ✅ Biblioteca compartida

---

## 📞 **Soporte**

### **Documentación**
- [Sistema de Autenticación](./SISTEMA_AUTENTICACION_PERMISOS.md)
- [Guía de Firebase CLI](./GUIA_FIREBASE_CLI.md)
- [Configuración OAuth](./CONFIGURACION_LOGIN.md)

### **Contacto**
- **Email**: william.comunidad@gmail.com
- **Proyecto**: Predicadores Católicos
- **Versión**: 1.0.0

---

## 📜 **Licencia**

Este proyecto está bajo la **Licencia MIT** - ver el archivo [LICENSE](LICENSE) para más detalles.

---

**🕊️ "Predica la palabra; persiste en hacerlo, sea o no sea oportuno" - 2 Timoteo 4:2**

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
