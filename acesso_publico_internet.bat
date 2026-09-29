@echo off
chcp 65001 > nul
echo ========================================================
echo   🌍 GERANDO LINK PUBLICO PARA INTERNET (4G / 5G / EXTERNO)
echo ========================================================
echo.
echo Iniciando tunel seguro gratuito para a porta 3000...
echo.

npx.cmd -y localtunnel --port 3000

pause
