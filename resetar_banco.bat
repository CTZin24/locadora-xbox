@echo off
chcp 65001 > nul
echo ========================================================
echo   🔄 RESETAR BANCO DE DADOS (locadora_xbox.sql)
echo ========================================================
echo.
echo ATENCAO: Isso redefinira as tabelas e dados para o padrao oficial da locadora Xbox!
echo.
pause

set "PG_BIN=%~dp0pgsql\bin"

echo [1/2] Recriando banco 'locadora_xbox'...
"%PG_BIN%\dropdb.exe" -h 127.0.0.1 -p 5432 -U postgres --if-exists locadora_xbox
"%PG_BIN%\createdb.exe" -h 127.0.0.1 -p 5432 -U postgres locadora_xbox

echo [2/2] Importando script locadora_xbox.sql...
"%PG_BIN%\psql.exe" -h 127.0.0.1 -p 5432 -U postgres -d locadora_xbox -f "%~dp0locadora_xbox.sql"

echo.
echo [SUCESSO] Banco de dados 'locadora_xbox' resetado com sucesso!
pause
