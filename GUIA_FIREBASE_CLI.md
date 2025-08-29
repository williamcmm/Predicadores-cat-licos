# Guía paso a paso: Instalación y configuración de Firebase CLI

## Paso 1: Verificación de requisitos ✅
```powershell
node --version    # Debe ser v14 o superior
npm --version     # Debe ser v6 o superior
```

## Paso 2: Instalación de Firebase CLI ⏳
```powershell
npm install -g firebase-tools
firebase --version  # Verificar instalación
```

## Paso 3: Autenticación con Firebase
```powershell
firebase login
```
- Se abrirá tu navegador
- Inicia sesión con tu cuenta de Google
- Autoriza Firebase CLI

## Paso 4: Verificar proyectos disponibles
```powershell
firebase projects:list
```

## Paso 5: Configurar el proyecto local
```powershell
cd C:\predicador
firebase init
```
Opciones a seleccionar:
- [ ] Authentication
- [ ] Hosting (opcional)
- Usar proyecto existente o crear nuevo
- Configuración por defecto

## Paso 6: Obtener configuración
```powershell
firebase apps:sdkconfig web
```

## Paso 7: Crear .env.local automáticamente
```powershell
.\setup-env.ps1
```

## Paso 8: Verificar configuración
```powershell
Get-Content .env.local
```

## Paso 9: Reiniciar servidor
```powershell
npm start
```

---
📝 **Estado actual:** Esperando Step 1-2
⏭️  **Siguiente:** Autenticación y configuración del proyecto
