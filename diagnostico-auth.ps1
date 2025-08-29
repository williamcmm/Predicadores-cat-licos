# Diagnóstico de problemas de autenticación
Write-Host "=== DIAGNÓSTICO DE AUTENTICACIÓN ===" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar variables de entorno
Write-Host "1. Verificando variables de entorno:" -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "   ✓ Archivo .env.local existe" -ForegroundColor Green
    $envContent = Get-Content ".env.local"
    $requiredVars = @(
        "REACT_APP_FIREBASE_API_KEY",
        "REACT_APP_FIREBASE_AUTH_DOMAIN",
        "REACT_APP_FIREBASE_PROJECT_ID"
    )
    
    foreach ($var in $requiredVars) {
        $found = $envContent | Where-Object { $_ -match "^$var=" }
        if ($found) {
            Write-Host "   ✓ $var configurado" -ForegroundColor Green
        } else {
            Write-Host "   ✗ $var FALTANTE" -ForegroundColor Red
        }
    }
} else {
    Write-Host "   ✗ Archivo .env.local NO EXISTE" -ForegroundColor Red
}

Write-Host ""

# 2. Verificar proyecto Firebase
Write-Host "2. Verificando proyecto Firebase:" -ForegroundColor Yellow
try {
    $currentProject = firebase use 2>$null | Out-String
    if ($currentProject -match "predicadores-catolicos") {
        Write-Host "   ✓ Proyecto correcto seleccionado" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ Verifica el proyecto seleccionado" -ForegroundColor Yellow
        Write-Host "     Ejecuta: firebase use predicadores-catolicos" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ✗ Error al verificar proyecto Firebase" -ForegroundColor Red
}

Write-Host ""

# 3. Verificar archivos de configuración
Write-Host "3. Verificando archivos de código:" -ForegroundColor Yellow
$files = @(
    "src/config/firebase.js",
    "src/services/auth/authService.js",
    "src/context/AuthContext.js",
    "src/components/auth/LoginButton.jsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "   ✓ $file existe" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $file FALTANTE" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== PRÓXIMOS PASOS ===" -ForegroundColor Cyan
Write-Host "1. Ejecuta: firebase open auth" -ForegroundColor Gray
Write-Host "2. Habilita Google en Sign-in method" -ForegroundColor Gray
Write-Host "3. Añade 'localhost' en Authorized domains" -ForegroundColor Gray
Write-Host "4. Ejecuta: npm start" -ForegroundColor Gray
Write-Host "5. Prueba el botón de login" -ForegroundColor Gray
