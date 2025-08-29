# Script para configurar Google Authentication
Write-Host "Configurando Google Authentication..." -ForegroundColor Yellow

# Verificar que estemos en el proyecto correcto
$project = firebase use 2>$null
if ($project -match "predicadores-catolicos") {
    Write-Host "EXITO: Proyecto correcto seleccionado" -ForegroundColor Green
} else {
    Write-Host "ADVERTENCIA: Verifica que tengas el proyecto correcto seleccionado" -ForegroundColor Yellow
    firebase use --add
}

Write-Host ""
Write-Host "Para habilitar Google Authentication:" -ForegroundColor Cyan
Write-Host "1. Ejecuta: firebase open auth" -ForegroundColor Gray
Write-Host "2. En Sign-in method, habilita Google" -ForegroundColor Gray
Write-Host "3. En Settings > Authorized domains, asegurate que 'localhost' este incluido" -ForegroundColor Gray
Write-Host ""

Write-Host "¿Quieres abrir Firebase Console ahora? (s/n): " -NoNewline -ForegroundColor Yellow
$response = Read-Host

if ($response -eq "s" -or $response -eq "S" -or $response -eq "si" -or $response -eq "Si") {
    firebase open auth
    Write-Host "Abriendo Firebase Console..." -ForegroundColor Green
}

Write-Host ""
Write-Host "Una vez habilitado Google Auth, ejecuta: npm start" -ForegroundColor Cyan
Write-Host "Y prueba el boton de login en el header" -ForegroundColor Gray
