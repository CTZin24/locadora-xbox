@echo off
chcp 65001 > nul
echo ========================================================
echo   🎮 XBOX LOCADORA - INICIALIZADOR COMPLETO
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Verificando e iniciando Banco de Dados (Porta 5432)...
call "%~dp0iniciar_banco.bat"

echo.
echo [2/3] Iniciando Servidor da Locadora (Node.js)...
start "Xbox Locadora - Servidor Web" cmd /k "cd /d ""%~dp0"" && node server.js"

echo.
echo [3/3] Abrindo aplicacao no navegador...
timeout /t 2 > nul
start http://localhost:3000

echo.
echo ========================================================
echo   TUDO PRONTO!
echo   - Aplicacao Web: http://localhost:3000
echo   - DBeaver:       localhost:5432 (Banco: locadora_xbox, User: postgres)
echo ========================================================
pause
