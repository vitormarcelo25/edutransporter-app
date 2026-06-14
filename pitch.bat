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

echo Inserindo dados de teste...
docker exec -i mysql-node mysql -uedu -pedu123 edutransporte < "%~dp0init-dados.sql" >nul 2>&1
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

echo [ERRO] Java 21 nao encontrado!
echo Instale com: winget install Microsoft.OpenJDK.21
pause
exit /b 1

:found_java
echo [OK] Java encontrado: %JAVA_HOME%
echo.

echo [3/2] Iniciando Backend Java...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080"') do taskkill /PID %%a /F >nul 2>&1
cd /d "%~dp0API-OFC"
start "Java Backend" cmd /k "set "JAVA_HOME=%JAVA_HOME%" && mvnw.cmd spring-boot:run"
echo [OK] Backend - porta 8080
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
pause
