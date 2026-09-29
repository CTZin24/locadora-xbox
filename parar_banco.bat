@echo off
chcp 65001 > nul
echo ========================================================
echo   🛑 PARANDO POSTGRESQL (PORTA 5432)
echo ========================================================

if exist "%~dp0pgsql\bin\pg_ctl.exe" (
    "%~dp0pgsql\bin\pg_ctl.exe" -D "%~dp0pgsql\data" stop
    echo.
    echo PostgreSQL portatil finalizado.
) else (
    echo [Info] PostgreSQL local portatil nao configurado nesta pasta.
    echo Caso esteja rodando como servico do Windows (ex: no PC da escola), ele e gerenciado pelo proprio Windows.
)
pause
