@echo off
REM Script batch para fazer git add e commit no Windows

echo === Configuracao Git ===
git config --local user.name
git config --local user.email
git remote get-url origin
echo.

echo === Status do Repositorio ===
git status --short

echo.
echo === Adicionando arquivos ao staging ===
git add .

echo.
echo === Status apos git add ===
git status --short

echo.
echo === Fazendo commit ===
git commit -m "Update: atualização do projeto StratoQuantumAI"

echo.
echo === Commit realizado com sucesso! ===
echo Para enviar ao repositorio remoto, execute: git push origin main

pause

