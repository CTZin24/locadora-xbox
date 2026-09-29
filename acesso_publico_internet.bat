@echo off
chcp 65001 > nul
echo ========================================================
echo   🌍 GERANDO LINK PUBLICO PARA INTERNET (4G / 5G / EXTERNO)
echo ========================================================
echo.
echo IP Publico IPv4 desta maquina: 45.172.97.186
echo IP na Rede Local (Wi-Fi):      192.168.1.6
echo.
echo Iniciando tunel seguro gratuito para a porta 3000...
echo.

npx.cmd -y localtunnel --port 3000

pause
