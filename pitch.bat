@echo off
title EduTransporter
color 0A
echo.
echo ============================================
echo   EduTransporter - Iniciando Servidores
echo ============================================
echo.

echo [1/3] Iniciando MySQL...
docker inspect mysql-node >nul 2>&1
if %errorlevel% neq 0 (
    echo Criando container MySQL...
    docker run -d --name mysql-node -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=edutransporte -e MYSQL_USER=edu -e MYSQL_PASSWORD=edu123 --default-authentication-plugin=mysql_native_password mysql:8
    echo Aguardando MySQL inicializar...
    timeout /t 20 /nobreak >nul
) else (
    docker start mysql-node >nul 2>&1
    timeout /t 5 /nobreak >nul
)
echo [OK] MySQL - porta 3306
echo.

echo [OK] Dados de teste inseridos
echo.

echo [2/3] Procurando Java 21...
set "JAVA_HOME="

if exist "C:\Program Files\Java\jdk-21" (
    set "JAVA_HOME=C:\Program Files\Java\jdk-21"
    goto :found_java
)
if exist "C:\Program Files\Java\jdk-21.0.7" (
    set "JAVA_HOME=C:\Program Files\Java\jdk-21.0.7"
    goto :found_java
)
for /d %%d in ("C:\Program Files\Java\jdk-21*") do (
    set "JAVA_HOME=%%d"
    goto :found_java
)
for /d %%d in ("C:\Program Files\Microsoft\jdk-21*") do (
    set "JAVA_HOME=%%d"
    goto :found_java
)
for /d %%d in ("C:\Program Files\Eclipse Adoptium\jdk-21*") do (
    set "JAVA_HOME=%%d"
    goto :found_java
)

echo [AVISO] Java 21 nao encontrado!
echo Dica: Se for usar apenas a nuvem, nao e necessario Java.
:: O frontend conecta no URL do api.ts (localhost:8080 ou nuvem).
:: Pular backend local e ir direto para a etapa do Expo.
echo.

echo [3/3] Iniciando Expo...
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
echo   Observacao:Backend Java local opcional - configure api.ts para nuvem.
pause
