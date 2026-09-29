@echo off
chcp 65001 > nul
echo ========================================================
echo   🔄 RESETAR BANCO DE DADOS (locadora_xbox.sql)
echo ========================================================
echo.
echo ATENCAO: Isso redefinira as tabelas e dados para o padrao da locadora Xbox!
echo.
pause

set "DROPDB_CMD=dropdb"
set "CREATEDB_CMD=createdb"
set "PSQL_CMD=psql"

rem Se houver binarios locais portateis
if exist "%~dp0pgsql\bin\dropdb.exe" (
    set "DROPDB_CMD=%~dp0pgsql\bin\dropdb.exe"
    set "CREATEDB_CMD=%~dp0pgsql\bin\createdb.exe"
    set "PSQL_CMD=%~dp0pgsql\bin\psql.exe"
)

echo [1/2] Recriando banco 'locadora_xbox'...
"%DROPDB_CMD%" -h 127.0.0.1 -p 5432 -U postgres --if-exists locadora_xbox
"%CREATEDB_CMD%" -h 127.0.0.1 -p 5432 -U postgres locadora_xbox

echo [2/2] Importando script locadora_xbox.sql...
"%PSQL_CMD%" -h 127.0.0.1 -p 5432 -U postgres -d locadora_xbox -f "%~dp0locadora_xbox.sql"

echo.
echo [SUCESSO] Banco de dados 'locadora_xbox' resetado com sucesso!
pause
