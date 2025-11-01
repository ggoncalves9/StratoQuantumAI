#!/bin/bash
# Script para garantir que o SSH use a chave github_ggoncalves9_new

echo "=== Verificando chaves SSH disponíveis ==="
echo ""
ls -la ~/.ssh/*.pub 2>/dev/null | grep -v "id_ed25519" || echo "Nenhuma chave pública encontrada (exceto id_ed25519)"
echo ""

# Verificar se a chave github_ggoncalves9_new existe
if [ -f ~/.ssh/github_ggoncalves9_new ]; then
    echo "✅ Chave github_ggoncalves9_new encontrada"
    chmod 600 ~/.ssh/github_ggoncalves9_new
else
    echo "❌ ERRO: Chave ~/.ssh/github_ggoncalves9_new NÃO encontrada!"
    echo ""
    echo "Chaves disponíveis:"
    ls -la ~/.ssh/ | grep -E "^-" | awk '{print $9}'
    exit 1
fi

if [ -f ~/.ssh/github_ggoncalves9_new.pub ]; then
    echo "✅ Chave pública github_ggoncalves9_new.pub encontrada"
    chmod 644 ~/.ssh/github_ggoncalves9_new.pub
else
    echo "❌ AVISO: Chave pública ~/.ssh/github_ggoncalves9_new.pub não encontrada"
fi

echo ""
echo "=== Configurando SSH config ==="

# Criar backup do config existente
if [ -f ~/.ssh/config ]; then
    cp ~/.ssh/config ~/.ssh/config.backup.$(date +%Y%m%d_%H%M%S)
    echo "Backup do SSH config criado"
fi

# Garantir que o diretório .ssh existe e tem as permissões corretas
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Criar/atualizar SSH config
cat > ~/.ssh/config << 'EOF'
# Configuração para GitHub pessoal (GuilhermeProz)
# Usa a chave github_ggoncalves9_new em vez de id_ed25519
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_ggoncalves9_new
  IdentitiesOnly yes
  AddKeysToAgent yes
  PreferredAuthentications publickey
EOF

chmod 600 ~/.ssh/config
echo "✅ SSH config atualizado com sucesso!"

echo ""
echo "=== Verificando configuração ==="
echo "Conteúdo do SSH config para github.com:"
grep -A 6 "Host github.com" ~/.ssh/config

echo ""
echo "=== Testando conexão SSH ==="
echo "Testando se a chave correta será usada..."
ssh -vT git@github.com 2>&1 | grep -i "identityfile\|offering\|authenticating" | head -5

echo ""
echo "=== Teste completo de conexão ==="
ssh -T git@github.com 2>&1 | head -3

echo ""
echo "✅ Configuração concluída!"
echo "Agora o SSH deve usar github_ggoncalves9_new em vez de id_ed25519"

