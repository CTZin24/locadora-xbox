@echo off
chcp 65001 > nul
echo ========================================================
echo   🔍 ABRINDO DBEAVER
echo ========================================================

if exist "C:\Program Files\DBeaver\dbeaver.exe" (
    echo Iniciando DBeaver...
    start "" "C:\Program Files\DBeaver\dbeaver.exe"
    exit
)

where dbeaver > nul 2>&1
if %errorlevel% == 0 (
    start "" dbeaver
    exit
)

echo [AVISO] DBeaver nao encontrado no caminho padrao: C:\Program Files\DBeaver\dbeaver.exe
echo Por favor, abra o DBeaver pelo Menu Iniciar do Windows.
pause
