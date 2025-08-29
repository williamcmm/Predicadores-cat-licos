# Script para crear .env.local desde la configuracion de Firebase
param(
    [string]$ApiKey,
    [string]$AuthDomain,
    [string]$ProjectId,
    [string]$StorageBucket,
    [string]$MessagingSenderId,
    [string]$AppId
)

function Show-FirebaseInstructions {
    Write-Host "Para obtener la configuracion de Firebase:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Opcion A - Firebase CLI:" -ForegroundColor Cyan
    Write-Host "  firebase apps:sdkconfig web" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Opcion B - Firebase Console:" -ForegroundColor Cyan
    Write-Host "  1. Ve a https://console.firebase.google.com/" -ForegroundColor Gray
    Write-Host "  2. Selecciona tu proyecto" -ForegroundColor Gray
    Write-Host "  3. Configuracion -> Project settings" -ForegroundColor Gray
    Write-Host "  4. Seccion 'Your apps' -> Web app" -ForegroundColor Gray
    Write-Host ""
}

function Create-EnvFile {
    param($config)
    
    $envContent = @"
# Firebase Configuration
# Generado automaticamente el $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

REACT_APP_FIREBASE_API_KEY=$($config.ApiKey)
REACT_APP_FIREBASE_AUTH_DOMAIN=$($config.AuthDomain)
REACT_APP_FIREBASE_PROJECT_ID=$($config.ProjectId)
REACT_APP_FIREBASE_STORAGE_BUCKET=$($config.StorageBucket)
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=$($config.MessagingSenderId)
REACT_APP_FIREBASE_APP_ID=$($config.AppId)

# Opcional: Gemini API Key para funcionalidades de IA
REACT_APP_GEMINI_API_KEY=
"@

    [System.IO.File]::WriteAllText(".env.local", $envContent)
    
    Write-Host "EXITO: Archivo .env.local creado exitosamente!" -ForegroundColor Green
    Write-Host "Ubicacion: $(Resolve-Path '.env.local')" -ForegroundColor Cyan
    
    # Mostrar contenido sin revelar valores sensibles
    Write-Host ""
    Write-Host "Variables configuradas:" -ForegroundColor Cyan
    Get-Content ".env.local" | Where-Object { $_ -match "^REACT_APP_" } | ForEach-Object {
        if ($_ -match "^([^=]+)=(.+)$") {
            $key = $matches[1]
            $value = if ($matches[2]) { "***" } else { "(vacio)" }
            Write-Host "  $key = $value" -ForegroundColor Gray
        }
    }
}

# Si no se proporcionan parametros, mostrar instrucciones y pedir datos
if (-not $ApiKey) {
    Show-FirebaseInstructions
    
    Write-Host "Introduce los valores de tu configuracion Firebase:" -ForegroundColor Yellow
    Write-Host "(Puedes obtenerlos ejecutando: firebase apps:sdkconfig web)" -ForegroundColor Gray
    Write-Host ""
    
    $ApiKey = Read-Host "API Key"
    $AuthDomain = Read-Host "Auth Domain (ej: tu-proyecto.firebaseapp.com)"
    $ProjectId = Read-Host "Project ID"
    $StorageBucket = Read-Host "Storage Bucket (ej: tu-proyecto.appspot.com)"
    $MessagingSenderId = Read-Host "Messaging Sender ID"
    $AppId = Read-Host "App ID"
}

# Crear el archivo .env.local
$config = @{
    ApiKey = $ApiKey
    AuthDomain = $AuthDomain
    ProjectId = $ProjectId
    StorageBucket = $StorageBucket
    MessagingSenderId = $MessagingSenderId
    AppId = $AppId
}

Create-EnvFile -config $config

Write-Host ""
Write-Host "Configuracion completa!" -ForegroundColor Green
Write-Host "Ahora puedes ejecutar: npm start" -ForegroundColor Cyan
Write-Host "El servidor debe reiniciarse para cargar las nuevas variables" -ForegroundColor Yellow
