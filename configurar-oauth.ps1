Write-Host "=== CONFIGURACIÓN DE URIs AUTORIZADOS ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para el Client ID: 605560352237-ljae7e3595llp8kopsgsqkgrvs5meuj9.apps.googleusercontent.com" -ForegroundColor Yellow
Write-Host ""
Write-Host "DEBES CONFIGURAR ESTOS URIs EN GOOGLE CLOUD CONSOLE:" -ForegroundColor Yellow
Write-Host ""
Write-Host "URIs de origen autorizados:" -ForegroundColor Green
Write-Host "  ✓ http://localhost:3000" -ForegroundColor Gray
Write-Host "  ✓ https://predicadores-catolicos.web.app" -ForegroundColor Gray  
Write-Host "  ✓ https://predicadores-catolicos.firebaseapp.com" -ForegroundColor Gray
Write-Host ""
Write-Host "URIs de redirección autorizados:" -ForegroundColor Green
Write-Host "  ✓ http://localhost:3000" -ForegroundColor Gray
Write-Host "  ✓ https://predicadores-catolicos.web.app/__/auth/handler" -ForegroundColor Gray
Write-Host "  ✓ https://predicadores-catolicos.firebaseapp.com/__/auth/handler" -ForegroundColor Gray
Write-Host ""
Write-Host "PASOS:" -ForegroundColor Cyan
Write-Host "1. Ve a Google Cloud Console (ya abierto)" -ForegroundColor White
Write-Host "2. Busca el Client ID: 605560352237-ljae7e3595llp8kopsgsqkgrvs5meuj9" -ForegroundColor White
Write-Host "3. Edítalo y agrega todos los URIs de arriba" -ForegroundColor White
Write-Host "4. Guarda los cambios" -ForegroundColor White
Write-Host "5. Espera 5 minutos para que se propaguen los cambios" -ForegroundColor White
Write-Host ""
Write-Host "Después ejecuta: npm start y prueba el login" -ForegroundColor Green
