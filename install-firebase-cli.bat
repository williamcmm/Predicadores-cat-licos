@echo off
echo 🔥 Verificando instalacion de Firebase CLI...
echo.

REM Verificar Node.js
echo Verificando Node.js...
node --version 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js no esta instalado
    echo Descarga Node.js desde: https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✅ Node.js encontrado:
    node --version
)

REM Verificar npm
echo.
echo Verificando npm...
npm --version 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm no esta disponible
    pause
    exit /b 1
) else (
    echo ✅ npm encontrado:
    npm --version
)

echo.
echo 🚀 Instalando Firebase CLI...
echo Esto puede tomar unos minutos...
npm install -g firebase-tools

echo.
echo 📋 Verificando instalacion...
firebase --version 2>nul
if %errorlevel% neq 0 (
    echo ❌ Error en la instalacion de Firebase CLI
    pause
    exit /b 1
) else (
    echo ✅ Firebase CLI instalado exitosamente:
    firebase --version
)

echo.
echo 🎉 ¡Instalacion completada!
echo.
echo Siguientes pasos:
echo 1. firebase login
echo 2. firebase init
echo 3. firebase apps:sdkconfig web
echo.
pause
