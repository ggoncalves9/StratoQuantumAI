#!/bin/bash
# Script para forçar o uso da chave github_ggoncalves9_new

echo "=== Verificando chaves SSH ==="
echo ""

# Verificar se a chave existe
if [ ! -f ~/.ssh/github_ggoncalves9_new ]; then
    echo "❌ ERRO: Chave ~/.ssh/github_ggoncalves9_new NÃO encontrada!"
    echo "Por favor, certifique-se de que a chave existe."
    exit 1
fi

echo "✅ Chave github_ggoncalves9_new encontrada"
chmod 600 ~/.ssh/github_ggoncalves9_new

# Atualizar SSH config com configuração mais restritiva
cat > ~/.ssh/config << 'EOF'
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
  
# Desabilitar outras chaves para GitHub (opcional, mas garante que não use id_ed25519)
Host github.com github.*
  IdentitiesOnly yes
  IdentityFile ~/.ssh/github_ggoncalves9_new
EOF

chmod 600 ~/.ssh/config
echo "✅ SSH config atualizado!"

# Adicionar chave ao ssh-agent (se estiver rodando)
if [ -n "$SSH_AUTH_SOCK" ]; then
    echo ""
    echo "=== Adicionando chave ao ssh-agent ==="
    ssh-add ~/.ssh/github_ggoncalves9_new 2>/dev/null || echo "AVISO: Não foi possível adicionar ao ssh-agent (pode ser necessário executar ssh-add manualmente)"
fi

echo ""
echo "=== Verificando qual chave será usada ==="
ssh -vT git@github.com 2>&1 | grep -E "(IdentityFile|Offering|identity|authenticating)" | head -5

echo ""
echo "=== Teste de conexão ==="
ssh -T git@github.com

echo ""
echo "✅ Configuração aplicada!"
echo "Agora o Git deve usar github_ggoncalves9_new automaticamente"

