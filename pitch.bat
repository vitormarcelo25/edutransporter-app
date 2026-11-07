@echo off
title EduTransporter
color 0A
echo.
echo ============================================
echo   EduTransporter - Iniciando App
echo ============================================
echo.

echo [1/1] Iniciando Expo...
cd /d "%~dp0"
start "Expo Frontend" cmd /k "npx expo start --web"
echo [OK] Frontend - porta 8081
echo.

echo ============================================
echo   PRONTO! Abra: http://localhost:8081
echo ============================================
echo.
echo   CPF: 16006485474
echo   Senha: 12345
echo.
echo   Backend na nuvem: https://backend-edutransporte.onrender.com
echo   Admin: chave admin26
pause
