#!/bin/bash
# Script para fazer git add e commit

echo "=== Configuração Git ==="
echo "Usuário: $(git config --local user.name)"
echo "Email: $(git config --local user.email)"
echo "Remote URL: $(git remote get-url origin)"
echo ""

echo "=== Status do Repositório ==="
git status --short

echo ""
echo "=== Adicionando arquivos ao staging ==="
git add .

echo ""
echo "=== Status após git add ==="
git status --short

echo ""
echo "=== Fazendo commit ==="
git commit -m "Update: atualização do projeto StratoQuantumAI"

echo ""
echo "=== Commit realizado com sucesso! ==="
echo "Para enviar ao repositório remoto, execute: git push origin main"

