#!/bin/bash
# Script para configurar Git e SSH para este repositório

# Configurar usuário Git localmente para este repositório
git config --local user.name "GuilhermeProz"
git config --local user.email "ggoncalves9@gmail.com"  # Ajuste se necessário

# Verificar se a chave SSH existe
SSH_KEY_PATH="$HOME/.ssh/github_ggoncalves9_new"
if [ -f "$SSH_KEY_PATH" ]; then
    echo "Chave SSH encontrada: $SSH_KEY_PATH"
else
    echo "AVISO: Chave SSH não encontrada em $SSH_KEY_PATH"
    echo "Por favor, certifique-se de que a chave existe ou ajuste o caminho."
    exit 1
fi

# Configurar SSH config para GitHub usando a chave específica
SSH_CONFIG="$HOME/.ssh/config"
GITHUB_HOST_CONFIG="
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_ggoncalves9_new
  IdentitiesOnly yes
"

# Verificar se já existe configuração para github.com
if grep -q "^Host github.com" "$SSH_CONFIG" 2>/dev/null; then
    echo "Configuração para github.com já existe no SSH config"
    echo "Por favor, atualize manualmente para usar: IdentityFile ~/.ssh/github_ggoncalves9_new"
else
    echo "$GITHUB_HOST_CONFIG" >> "$SSH_CONFIG"
    echo "Configuração SSH adicionada para github.com"
fi

# Mudar remote de HTTPS para SSH
git remote set-url origin git@github.com:ggoncalves9/StratoQuantumAI.git

echo ""
echo "Configuração concluída!"
echo "Usuário Git configurado: $(git config --local user.name)"
echo "Remote URL: $(git remote get-url origin)"
echo ""
echo "Teste a conexão SSH com: ssh -T git@github.com"

