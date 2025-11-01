"""
Mock data para chat interno da equipe - MVP para demonstração aos investidores
"""

from datetime import datetime, timedelta
import random

class TeamChatMock:
    def __init__(self):
        self.personas = {
            "hacker": {
                "name": "Alex Chen",
                "role": "Tech Lead",
                "avatar": "👨‍💻",
                "status": "online",
                "personality": "técnico, direto, focado em soluções",
                "typical_responses": [
                    "Vou analisar a arquitetura e te retorno em 15min",
                    "Implementei a otimização, performance melhorou 40%",
                    "Precisamos refatorar esse módulo, está com debt técnico",
                    "Deploy realizado com sucesso, tudo funcionando",
                    "Identifiquei o bug, já tenho a correção pronta"
                ]
            },
            "hipster": {
                "name": "Maya Santos",
                "role": "UX/UI Designer", 
                "avatar": "🎨",
                "status": "online",
                "personality": "criativa, user-centric, visual",
                "typical_responses": [
                    "Criei um protótipo novo, quer dar uma olhada?",
                    "Os usuários estão adorando a nova interface!",
                    "Sugiro ajustarmos as cores para melhor acessibilidade",
                    "Fiz uns testes de usabilidade, tenho insights interessantes",
                    "Que tal uma animação sutil nessa transição?"
                ]
            },
            "marketing": {
                "name": "Carlos Oliveira",
                "role": "Growth Marketing",
                "avatar": "📈", 
                "status": "online",
                "personality": "data-driven, growth-focused, estratégico",
                "typical_responses": [
                    "CAC diminuiu 25% com a nova estratégia!",
                    "Vamos testar essa hipótese com A/B test",
                    "Conversão aumentou depois da otimização da landing",
                    "Identifiquei uma oportunidade no segmento B2B",
                    "ROI da campanha bateu 300%, vamos escalar!"
                ]
            },
            "hustle": {
                "name": "Você",
                "role": "CEO/Founder",
                "avatar": "🚀",
                "status": "online", 
                "personality": "visionário, estratégico, executor",
                "typical_responses": []  # Usuário atual
            }
        }
        
        self.conversation_history = self._generate_mock_conversations()
    
    def _generate_mock_conversations(self):
        """Gera histórico de conversas mock para demonstração"""
        now = datetime.now()
        
        conversations = [
            # Conversa sobre nova feature
            {
                "timestamp": now - timedelta(hours=2),
                "sender": "hustle",
                "message": "Pessoal, precisamos implementar o chat com IA até sexta. Conseguimos?"
            },
            {
                "timestamp": now - timedelta(hours=2, minutes=2),
                "sender": "hacker", 
                "message": "Vou analisar a arquitetura e te retorno em 15min"
            },
            {
                "timestamp": now - timedelta(hours=2, minutes=5),
                "sender": "hipster",
                "message": "Já tenho uns mockups prontos! Quer ver?"
            },
            {
                "timestamp": now - timedelta(hours=2, minutes=8),
                "sender": "marketing",
                "message": "Essa feature vai impactar muito o onboarding. Vamos medir tudo!"
            },
            
            # Conversa sobre métricas
            {
                "timestamp": now - timedelta(hours=1),
                "sender": "marketing",
                "message": "CAC diminuiu 25% com a nova estratégia! 🎉"
            },
            {
                "timestamp": now - timedelta(hours=1, minutes=2),
                "sender": "hustle",
                "message": "Excelente! Qual foi o driver principal?"
            },
            {
                "timestamp": now - timedelta(hours=1, minutes=5),
                "sender": "marketing", 
                "message": "Otimização da landing page + segmentação melhor no ads"
            },
            
            # Conversa sobre UX
            {
                "timestamp": now - timedelta(minutes=30),
                "sender": "hipster",
                "message": "Fiz uns testes de usabilidade, tenho insights interessantes"
            },
            {
                "timestamp": now - timedelta(minutes=28),
                "sender": "hustle",
                "message": "Conta aí! O que descobriu?"
            },
            {
                "timestamp": now - timedelta(minutes=25),
                "sender": "hipster",
                "message": "Usuários se confundem no step 3 do onboarding. Vou redesenhar"
            },
            
            # Conversa técnica recente
            {
                "timestamp": now - timedelta(minutes=10),
                "sender": "hacker",
                "message": "Deploy realizado com sucesso, tudo funcionando ✅"
            },
            {
                "timestamp": now - timedelta(minutes=8),
                "sender": "hustle", 
                "message": "Perfeito! Performance melhorou?"
            },
            {
                "timestamp": now - timedelta(minutes=5),
                "sender": "hacker",
                "message": "Implementei a otimização, performance melhorou 40%"
            }
        ]
        
        return sorted(conversations, key=lambda x: x['timestamp'])
    
    def get_persona_info(self, persona_id: str):
        """Retorna informações da persona"""
        return self.personas.get(persona_id, {})
    
    def get_conversation_history(self, limit: int = 50):
        """Retorna histórico de conversas"""
        return self.conversation_history[-limit:]
    
    def add_message(self, sender: str, message: str):
        """Adiciona nova mensagem ao histórico"""
        new_message = {
            "timestamp": datetime.now(),
            "sender": sender,
            "message": message
        }
        self.conversation_history.append(new_message)
        return new_message
    
    def get_auto_response(self, persona_id: str, user_message: str = ""):
        """Gera resposta automática baseada na personalidade"""
        if persona_id not in self.personas or persona_id == "hustle":
            return None
            
        persona = self.personas[persona_id]
        responses = persona["typical_responses"]
        
        # Lógica simples para escolher resposta baseada na mensagem
        if any(word in user_message.lower() for word in ["bug", "erro", "problema"]):
            if persona_id == "hacker":
                return "Identifiquei o bug, já tenho a correção pronta"
        elif any(word in user_message.lower() for word in ["design", "interface", "ux"]):
            if persona_id == "hipster":
                return "Criei um protótipo novo, quer dar uma olhada?"
        elif any(word in user_message.lower() for word in ["vendas", "conversão", "marketing"]):
            if persona_id == "marketing":
                return "Vamos testar essa hipótese com A/B test"
        
        # Resposta aleatória se não houver match específico
        return random.choice(responses)
    
    def simulate_activity(self):
        """Simula atividade da equipe para demonstração"""
        active_personas = ["hacker", "hipster", "marketing"]
        
        # Simula mensagem aleatória
        sender = random.choice(active_personas)
        persona = self.personas[sender]
        message = random.choice(persona["typical_responses"])
        
        return self.add_message(sender, message)

# Dados para exportação
team_chat_mock = TeamChatMock()

# Função para obter dados mock
def get_team_data():
    return {
        "personas": team_chat_mock.personas,
        "conversations": team_chat_mock.get_conversation_history(),
        "active_users": 4,
        "online_status": {
            "hacker": True,
            "hipster": True, 
            "marketing": True,
            "hustle": True
        }
    }