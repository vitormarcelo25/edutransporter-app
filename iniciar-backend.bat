@echo off
title EduTransporter Java Backend
set JAVA_HOME=C:\Program Files\Java\jdk-21
cd /d "%~dp0API-OFC"
call mvnw.cmd spring-boot:run
pause
