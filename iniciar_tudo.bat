@echo off
chcp 65001 > nul
echo ========================================================
echo   🎮 XBOX LOCADORA - INICIALIZADOR COMPLETO
echo ========================================================
echo.

cd /d "%~dp0"

rem Verifica se a pasta node_modules existe. Se não existir, instala automaticamente!
if not exist "%~dp0node_modules\" (
    echo [Info] Primeira execucao detectada: instalando dependencias (npm install)...
    call npm install
    if errorlevel 1 (
        echo [Erro] Falha ao instalar dependencias do Node.js.
        pause
        exit /b 1
    )
    echo [OK] Dependencias instaladas com sucesso!
    echo.
)

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
echo   - Celular/Wi-Fi: http://192.168.1.6:3000
echo   - DBeaver:       localhost:5432 (Banco: locadora_xbox, User: postgres)
echo ========================================================
pause
