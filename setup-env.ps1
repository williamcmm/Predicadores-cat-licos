# Script para configurar variables de entorno desde Firebase CLI
# Ejecuta este script después de correr: firebase apps:sdkconfig web

param(
    [string]$ConfigOutput
)

Write-Host "🔥 Configurando variables de entorno para Firebase..." -ForegroundColor Yellow

# Si no se proporciona la configuración como parámetro, pedirla
if (-not $ConfigOutput) {
    Write-Host "`nPor favor, ejecuta primero: firebase apps:sdkconfig web"
    Write-Host "Luego copia y pega toda la salida aquí:`n" -ForegroundColor Cyan
    
    $lines = @()
    do {
        $line = Read-Host
        if ($line -ne "") {
            $lines += $line
        }
    } while ($line -ne "")
    
    $ConfigOutput = $lines -join "`n"
}

# Crear el archivo .env.local
$envContent = @"
# Firebase Configuration - Generado automáticamente
# Fecha: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

"@

# Extraer valores usando regex
$patterns = @{
    'apiKey' = 'apiKey:\s*[''"]([^''"]+)[''"]'
    'authDomain' = 'authDomain:\s*[''"]([^''"]+)[''"]'
    'projectId' = 'projectId:\s*[''"]([^''"]+)[''"]'
    'storageBucket' = 'storageBucket:\s*[''"]([^''"]+)[''"]'
    'messagingSenderId' = 'messagingSenderId:\s*[''"]([^''"]+)[''"]'
    'appId' = 'appId:\s*[''"]([^''"]+)[''"]'
}

foreach ($key in $patterns.Keys) {
    if ($ConfigOutput -match $patterns[$key]) {
        $value = $matches[1]
        $envKey = "REACT_APP_FIREBASE_$($key.ToUpper())"
        if ($key -eq 'messagingSenderId') {
            $envKey = "REACT_APP_FIREBASE_MESSAGING_SENDER_ID"
        }
        $envContent += "$envKey=$value`n"
        Write-Host "✅ $envKey configurado" -ForegroundColor Green
    } else {
        Write-Host "⚠️  No se encontró $key en la configuración" -ForegroundColor Yellow
    }
}

# Añadir variable para Gemini API (opcional)
$envContent += "`n# Opcional: Gemini API Key para funcionalidades de IA`n"
$envContent += "REACT_APP_GEMINI_API_KEY=`n"

# Guardar el archivo
$envPath = ".env.local"
$envContent | Out-File -FilePath $envPath -Encoding UTF8

Write-Host "`n🎉 Archivo .env.local creado exitosamente!" -ForegroundColor Green
Write-Host "📁 Ubicación: $(Resolve-Path $envPath)" -ForegroundColor Cyan

# Mostrar el contenido (sin valores sensibles)
Write-Host "`n📄 Contenido del archivo:" -ForegroundColor Cyan
Get-Content $envPath | ForEach-Object {
    if ($_ -match "^REACT_APP_FIREBASE_.*=(.+)$") {
        $key = ($_ -split "=")[0]
        Write-Host "$key=***" -ForegroundColor Gray
    } else {
        Write-Host $_ -ForegroundColor Gray
    }
}

Write-Host "`n🚀 Ahora puedes ejecutar: npm start" -ForegroundColor Green
Write-Host "💡 Tip: El servidor debe reiniciarse para cargar las nuevas variables" -ForegroundColor Yellow
