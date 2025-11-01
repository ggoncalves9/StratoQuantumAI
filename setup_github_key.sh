#!/bin/bash
# Script para configurar e verificar o uso da chave github_ggoncalves9_new

set -e

echo "=========================================="
echo "Configuração SSH para GitHub"
echo "Forçando uso de github_ggoncalves9_new"
echo "=========================================="
echo ""

# 1. Verificar se as chaves existem
echo "1. Verificando chaves SSH..."
if [ ! -f ~/.ssh/github_ggoncalves9_new ]; then
    echo "❌ ERRO: Chave ~/.ssh/github_ggoncalves9_new NÃO encontrada!"
    echo ""
    echo "Chaves disponíveis em ~/.ssh/:"
    ls -la ~/.ssh/ | grep -E "^-" | awk '{print $9}' || echo "Nenhuma chave encontrada"
    echo ""
    echo "Por favor, certifique-se de que a chave existe."
    exit 1
fi

if [ ! -f ~/.ssh/github_ggoncalves9_new.pub ]; then
    echo "⚠️  AVISO: Chave pública ~/.ssh/github_ggoncalves9_new.pub não encontrada"
    echo "Isso não impede o uso, mas é recomendado ter a chave pública também."
else
    echo "✅ Chave pública encontrada"
fi

# 2. Configurar permissões corretas
echo ""
echo "2. Configurando permissões..."
chmod 700 ~/.ssh 2>/dev/null || mkdir -p ~/.ssh && chmod 700 ~/.ssh
chmod 600 ~/.ssh/github_ggoncalves9_new
[ -f ~/.ssh/github_ggoncalves9_new.pub ] && chmod 644 ~/.ssh/github_ggoncalves9_new.pub
echo "✅ Permissões configuradas"

# 3. Atualizar SSH config
echo ""
echo "3. Atualizando SSH config..."

# Criar backup
if [ -f ~/.ssh/config ]; then
    BACKUP_FILE=~/.ssh/config.backup.$(date +%Y%m%d_%H%M%S)
    cp ~/.ssh/config "$BACKUP_FILE"
    echo "   Backup criado: $BACKUP_FILE"
fi

# Remover configurações antigas do GitHub se existirem
sed -i '/^Host github\.com$/,/^$/d' ~/.ssh/config 2>/dev/null || true
sed -i '/^Host github\.\*$/,/^$/d' ~/.ssh/config 2>/dev/null || true

# Adicionar nova configuração
cat >> ~/.ssh/config << 'EOF'

# Configuração para GitHub pessoal (GuilhermeProz)
# FORÇA o uso da chave github_ggoncalves9_new, ignorando id_ed25519
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_ggoncalves9_new
  IdentitiesOnly yes
  PreferredAuthentications publickey
  PubkeyAcceptedKeyTypes +ssh-rsa,ssh-ed25519
  AddKeysToAgent yes
  
# Garantir que TODOS os hosts github.* usem apenas esta chave
Host github.*
  IdentitiesOnly yes
  IdentityFile ~/.ssh/github_ggoncalves9_new
EOF

chmod 600 ~/.ssh/config
echo "✅ SSH config atualizado"

# 4. Verificar configuração
echo ""
echo "4. Verificando configuração..."
echo "   Conteúdo do SSH config para GitHub:"
grep -A 10 "^Host github" ~/.ssh/config | head -15

# 5. Testar conexão
echo ""
echo "5. Testando conexão SSH..."
echo "   (Isso vai mostrar qual chave está sendo usada)"
echo ""

# Mostrar qual chave será usada
echo "   Verificando chave que será usada..."
ssh -vT git@github.com 2>&1 | grep -i "identityfile\|offering.*key\|authenticating" | head -5 || echo "   (Verificação de verbose)"

echo ""
echo "   Teste de autenticação:"
SSH_TEST=$(ssh -T git@github.com 2>&1)
if echo "$SSH_TEST" | grep -q "successfully authenticated\|Hi GuilhermeProz\|You've successfully authenticated"; then
    echo "   ✅ Autenticação bem-sucedida!"
    echo "$SSH_TEST" | head -3
else
    echo "   ⚠️  Resultado do teste:"
    echo "$SSH_TEST" | head -5
fi

echo ""
echo "=========================================="
echo "✅ Configuração concluída!"
echo "=========================================="
echo ""
echo "O SSH agora está configurado para usar:"
echo "  ✅ github_ggoncalves9_new (para GitHub pessoal)"
echo "  ❌ NÃO usará id_ed25519 (chave do trabalho)"
echo ""
echo "Você pode fazer git push agora!"

