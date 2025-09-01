# Diagnóstico de problema OAuth
Write-Host "=== DIAGNÓSTICO DE ERROR OAUTH ===" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar proyecto actual
Write-Host "1. Verificando proyecto Firebase:" -ForegroundColor Yellow
$project = firebase use 2>$null
if ($project) {
    Write-Host "   Proyecto actual: $project" -ForegroundColor Green
} else {
    Write-Host "   Error al verificar proyecto" -ForegroundColor Red
}

Write-Host ""

# 2. Verificar configuración de functions
Write-Host "2. Verificando configuración de Cloud Functions:" -ForegroundColor Yellow
$config = firebase functions:config:get 2>$null
if ($config -and $config -match "oauth") {
    Write-Host "   Configuración OAuth encontrada" -ForegroundColor Green
} else {
    Write-Host "   ⚠ No se encontró configuración OAuth" -ForegroundColor Yellow
    Write-Host "     Necesitas ejecutar:" -ForegroundColor Gray
    Write-Host "     firebase functions:config:set oauth.client_id='TU_CLIENT_ID' oauth.client_secret='TU_CLIENT_SECRET'" -ForegroundColor Gray
}

Write-Host ""

# 3. Verificar variables de entorno locales
Write-Host "3. Verificando variables de entorno:" -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local"
    $apiKey = $envContent | Where-Object { $_ -match "^REACT_APP_FIREBASE_API_KEY=" }
    if ($apiKey) {
        Write-Host "   ✓ API Key configurado en .env.local" -ForegroundColor Green
    } else {
        Write-Host "   ✗ API Key no encontrado en .env.local" -ForegroundColor Red
    }
} else {
    Write-Host "   ✗ Archivo .env.local no existe" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== PASOS PARA RESOLVER ===" -ForegroundColor Cyan
Write-Host "1. Ve a: https://console.cloud.google.com/apis/credentials?project=predicadores-catolicos" -ForegroundColor Gray
Write-Host "2. Crea nuevas credenciales OAuth 2.0" -ForegroundColor Gray
Write-Host "3. Configura URIs autorizados correctamente" -ForegroundColor Gray
Write-Host "4. Actualiza Firebase Functions con: firebase functions:config:set" -ForegroundColor Gray
Write-Host "5. Redespliegra functions: firebase deploy --only functions" -ForegroundColor Gray
