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
echo   CPF: 71409312060
echo   Senha: 123456
echo.
echo   Observacao: App rodando com dados mock.
echo   Para conectar backend na nuvem, edite services/api.ts.
pause
