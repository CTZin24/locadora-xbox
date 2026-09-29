@echo off
chcp 65001 > nul
echo ========================================================
echo   🛑 PARANDO POSTGRESQL (PORTA 5432)
echo ========================================================

set "PG_BIN=%~dp0pgsql\bin"
set "PG_DATA=%~dp0pgsql\data"

"%PG_BIN%\pg_ctl.exe" -D "%PG_DATA%" stop

echo.
echo PostgreSQL finalizado.
pause
