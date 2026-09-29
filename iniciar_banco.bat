@echo off
chcp 65001 > nul
echo ========================================================
echo   🐘 INICIANDO BANCO DE DADOS NA PORTA 5432
echo ========================================================

rem 1. Verifica se o PostgreSQL ja esta em execucao na porta 5432 (ex: servico no PC da escola)
netstat -ano | findstr ":5432 " | findstr "LISTENING" > nul
if %errorlevel% == 0 (
    echo [OK] O PostgreSQL ja esta ativo e respondendo na porta 5432!
    goto print_info
)

rem 2. Se houver pasta local pgsql portatil dentro do projeto
if exist "%~dp0pgsql\bin\pg_ctl.exe" (
    echo Iniciando cluster local do PostgreSQL...
    "%~dp0pgsql\bin\pg_ctl.exe" -D "%~dp0pgsql\data" -l "%~dp0pgsql\pgsql.log" start
    timeout /t 2 > nul
    goto print_info
)

rem 3. Se pg_ctl estiver disponivel no PATH do sistema
where pg_ctl > nul 2>&1
if %errorlevel% == 0 (
    echo Iniciando PostgreSQL pelo sistema...
    pg_ctl start
    timeout /t 2 > nul
    goto print_info
)

echo.
echo [Aviso] O PostgreSQL nao parece estar rodando na porta 5432.
echo No computador da escola:
echo   1. Inicie o servico do PostgreSQL (pelo menu Iniciar ou Services.msc)
echo   2. Ou abra o DBeaver / pgAdmin e verifique a conexao na porta 5432.
echo.

:print_info
echo.
echo ========================================================
echo   DADOS PARA CONEXAO NO DBEAVER / PGADMIN:
echo   - Host / Servidor:   localhost  (ou 127.0.0.1)
echo   - Porta:             5432
echo   - Banco de Dados:    locadora_xbox
echo   - Usuario (User):    postgres
echo   - Senha (Password):  postgres
echo ========================================================
echo.
