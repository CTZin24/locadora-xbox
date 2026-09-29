@echo off
chcp 65001 > nul
echo ========================================================
echo   🐘 INICIANDO BANCO DE DADOS NA PORTA 5432
echo ========================================================

set "PG_BIN=%~dp0pgsql\bin"
set "PG_DATA=%~dp0pgsql\data"
set "PG_LOG=%~dp0pgsql\pgsql.log"

rem Verifica se ja esta rodando na porta 5432
netstat -ano | findstr ":5432 " | findstr "LISTENING" > nul
if %errorlevel% == 0 (
    echo [OK] O banco de dados ja esta ativo na porta 5432!
    goto print_info
)

echo Iniciando o cluster do banco de dados...
"%PG_BIN%\pg_ctl.exe" -D "%PG_DATA%" -l "%PG_LOG%" start

timeout /t 2 > nul

:print_info
echo.
echo ========================================================
echo   DADOS PARA CONEXAO NO DBEAVER:
echo   - Host / Servidor:   localhost  (ou 127.0.0.1)
echo   - Porta:             5432
echo   - Banco de Dados:    locadora_xbox
echo   - Usuario (User):    postgres
echo   - Senha (Password):  postgres
echo ========================================================
echo.
