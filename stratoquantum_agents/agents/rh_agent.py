"""
Strato Quantum - Agente de Recursos Humanos
Especializado em gestão de pessoas, recrutamento e desenvolvimento
"""

from crewai import Agent, Task, Crew
from langchain.tools import Tool
from typing import Dict, List, Any
import json
from datetime import datetime, timedelta

class RHAgent:
    def __init__(self):
        self.agent = Agent(
            role='Especialista em Recursos Humanos',
            goal='Otimizar processos de RH, recrutamento e desenvolvimento de pessoas',
            backstory="""
            Sou um especialista em Recursos Humanos com mais de 12 anos de experiência.
            Minha expertise inclui recrutamento e seleção, desenvolvimento de talentos,
            gestão de performance e cultura organizacional. Utilizo dados e analytics
            para tomar decisões estratégicas sobre pessoas.
            """,
            verbose=True,
            allow_delegation=False,
            tools=[
                self._create_recruitment_tool(),
                self._create_performance_tool(),
                self._create_culture_tool(),
                self._create_training_tool()
            ]
        )
    
    def _create_recruitment_tool(self) -> Tool:
        def analyze_recruitment(position: str = "all") -> str:
            """Analisa processo de recrutamento e seleção"""
            mock_data = {
                "vagas_abertas": 12,
                "candidatos_total": 89,
                "em_processo": 23,
                "tempo_medio_contratacao": 7,
                "taxa_conversao": 25.8,
                "custo_por_contratacao": 2500
            }
            
            vagas_detalhes = [
                {"cargo": "Desenvolvedor Full Stack Sênior", "candidatos": 15, "status": "Aberta", "urgencia": "Alta"},
                {"cargo": "Analista de Marketing Digital", "candidatos": 28, "status": "Aberta", "urgencia": "Média"},
                {"cargo": "Product Manager", "candidatos": 42, "status": "Pausada", "urgencia": "Baixa"},
                {"cargo": "UX Designer", "candidatos": 4, "status": "Aberta", "urgencia": "Alta"}
            ]
            
            analysis = f"""
            👥 ANÁLISE DE RECRUTAMENTO & SELEÇÃO
            
            📊 MÉTRICAS GERAIS:
            • Vagas Abertas: {mock_data['vagas_abertas']}
            • Total de Candidatos: {mock_data['candidatos_total']}
            • Em Processo Seletivo: {mock_data['em_processo']}
            • Tempo Médio de Contratação: {mock_data['tempo_medio_contratacao']} dias
            • Taxa de Conversão: {mock_data['taxa_conversao']:.1f}%
            • Custo por Contratação: R$ {mock_data['custo_por_contratacao']:,.2f}
            
            🎯 VAGAS PRIORITÁRIAS:
            """
            
            for vaga in vagas_detalhes:
                urgencia_icon = "🔴" if vaga['urgencia'] == "Alta" else "🟡" if vaga['urgencia'] == "Média" else "🟢"
                analysis += f"""
            {urgencia_icon} {vaga['cargo']}
               • {vaga['candidatos']} candidatos
               • Status: {vaga['status']}
               • Urgência: {vaga['urgencia']}
            """
            
            analysis += """
            
            📋 RECOMENDAÇÕES:
            • Acelerar processo para vagas de alta urgência
            • Melhorar sourcing para UX Designer (poucos candidatos)
            • Reativar vaga de Product Manager se necessário
            • Implementar testes técnicos automatizados
            """
            
            return analysis
        
        return Tool(
            name="recruitment_analyzer",
            description="Analisa processos de recrutamento e fornece insights sobre contratações",
            func=analyze_recruitment
        )
    
    def _create_performance_tool(self) -> Tool:
        def analyze_performance(period: str = "quarterly") -> str:
            """Analisa performance e engajamento da equipe"""
            mock_performance = {
                "colaboradores_ativos": 45,
                "taxa_retencao": 92.5,
                "nps_funcionarios": 8.2,
                "avaliacoes_pendentes": 3,
                "promocoes_trimestre": 5,
                "turnover_rate": 7.5
            }
            
            departamentos = [
                {"nome": "Tecnologia", "performance": 9.1, "engajamento": 8.8, "colaboradores": 15},
                {"nome": "Marketing", "performance": 8.7, "engajamento": 8.5, "colaboradores": 8},
                {"nome": "Comercial", "performance": 8.9, "engajamento": 8.2, "colaboradores": 12},
                {"nome": "Produto", "performance": 9.0, "engajamento": 9.1, "colaboradores": 6},
                {"nome": "Operações", "performance": 8.4, "engajamento": 7.9, "colaboradores": 4}
            ]
            
            analysis = f"""
            📈 ANÁLISE DE PERFORMANCE & ENGAJAMENTO ({period.upper()})
            
            👥 MÉTRICAS GERAIS:
            • Colaboradores Ativos: {mock_performance['colaboradores_ativos']}
            • Taxa de Retenção: {mock_performance['taxa_retencao']:.1f}%
            • NPS Funcionários: {mock_performance['nps_funcionarios']:.1f}/10
            • Turnover Rate: {mock_performance['turnover_rate']:.1f}%
            • Promoções no Trimestre: {mock_performance['promocoes_trimestre']}
            • Avaliações Pendentes: {mock_performance['avaliacoes_pendentes']}
            
            🏢 PERFORMANCE POR DEPARTAMENTO:
            """
            
            for dept in departamentos:
                performance_icon = "🟢" if dept['performance'] >= 8.5 else "🟡" if dept['performance'] >= 7.5 else "🔴"
                analysis += f"""
            {performance_icon} {dept['nome']} ({dept['colaboradores']} pessoas)
               • Performance: {dept['performance']:.1f}/10
               • Engajamento: {dept['engajamento']:.1f}/10
            """
            
            # Identificar melhor e pior performance
            best_dept = max(departamentos, key=lambda x: x['performance'])
            worst_dept = min(departamentos, key=lambda x: x['performance'])
            
            analysis += f"""
            
            🏆 DESTAQUE: {best_dept['nome']} (Performance: {best_dept['performance']:.1f})
            ⚠️  ATENÇÃO: {worst_dept['nome']} (Performance: {worst_dept['performance']:.1f})
            
            📋 AÇÕES RECOMENDADAS:
            • Finalizar {mock_performance['avaliacoes_pendentes']} avaliações pendentes
            • Implementar plano de desenvolvimento para {worst_dept['nome']}
            • Replicar boas práticas de {best_dept['nome']}
            • Revisar estratégia de retenção (turnover em {mock_performance['turnover_rate']:.1f}%)
            """
            
            return analysis
        
        return Tool(
            name="performance_analyzer",
            description="Analisa performance e engajamento dos colaboradores",
            func=analyze_performance
        )
    
    def _create_culture_tool(self) -> Tool:
        def analyze_culture() -> str:
            """Analisa cultura organizacional e clima"""
            culture_metrics = {
                "satisfacao_geral": 8.3,
                "recomendacao_empresa": 8.7,
                "equilibrio_vida_trabalho": 7.9,
                "oportunidades_crescimento": 8.1,
                "comunicacao_interna": 7.6,
                "lideranca": 8.4
            }
            
            feedback_recente = [
                "Ambiente colaborativo e inovador",
                "Flexibilidade de horários é excelente",
                "Gostaria de mais oportunidades de treinamento",
                "Comunicação entre equipes pode melhorar",
                "Liderança é muito acessível e suportiva"
            ]
            
            analysis = f"""
            🏢 ANÁLISE DE CULTURA ORGANIZACIONAL
            
            📊 MÉTRICAS DE CLIMA (Escala 1-10):
            • Satisfação Geral: {culture_metrics['satisfacao_geral']:.1f}
            • Recomendação da Empresa: {culture_metrics['recomendacao_empresa']:.1f}
            • Equilíbrio Vida-Trabalho: {culture_metrics['equilibrio_vida_trabalho']:.1f}
            • Oportunidades de Crescimento: {culture_metrics['oportunidades_crescimento']:.1f}
            • Comunicação Interna: {culture_metrics['comunicacao_interna']:.1f}
            • Qualidade da Liderança: {culture_metrics['lideranca']:.1f}
            
            💬 FEEDBACK RECENTE DOS COLABORADORES:
            """
            
            for i, feedback in enumerate(feedback_recente, 1):
                analysis += f"   {i}. \"{feedback}\"\n"
            
            # Identificar pontos fortes e fracos
            strongest = max(culture_metrics.items(), key=lambda x: x[1])
            weakest = min(culture_metrics.items(), key=lambda x: x[1])
            
            analysis += f"""
            
            🟢 PONTO FORTE: {strongest[0].replace('_', ' ').title()} ({strongest[1]:.1f})
            🟡 ÁREA DE MELHORIA: {weakest[0].replace('_', ' ').title()} ({weakest[1]:.1f})
            
            📋 PLANO DE AÇÃO:
            • Implementar programa de comunicação interna
            • Expandir programa de treinamentos
            • Manter políticas de flexibilidade
            • Realizar pesquisa de clima trimestral
            • Criar comitê de cultura organizacional
            """
            
            return analysis
        
        return Tool(
            name="culture_analyzer",
            description="Analisa cultura organizacional e clima da empresa",
            func=analyze_culture
        )
    
    def _create_training_tool(self) -> Tool:
        def analyze_training(department: str = "all") -> str:
            """Analisa programas de treinamento e desenvolvimento"""
            training_data = {
                "programas_ativos": 8,
                "colaboradores_em_treinamento": 23,
                "horas_treinamento_mes": 156,
                "investimento_mensal": 15000,
                "taxa_conclusao": 87.5,
                "satisfacao_treinamentos": 8.6
            }
            
            programas = [
                {"nome": "Liderança Estratégica", "participantes": 8, "conclusao": 75, "satisfacao": 9.1},
                {"nome": "Desenvolvimento Técnico", "participantes": 12, "conclusao": 92, "satisfacao": 8.8},
                {"nome": "Soft Skills", "participantes": 15, "conclusao": 88, "satisfacao": 8.4},
                {"nome": "Certificações Técnicas", "participantes": 6, "conclusao": 83, "satisfacao": 9.0},
                {"nome": "Inglês Corporativo", "participantes": 10, "conclusao": 90, "satisfacao": 8.2}
            ]
            
            analysis = f"""
            📚 ANÁLISE DE TREINAMENTO & DESENVOLVIMENTO
            
            📊 MÉTRICAS GERAIS:
            • Programas Ativos: {training_data['programas_ativos']}
            • Colaboradores em Treinamento: {training_data['colaboradores_em_treinamento']}
            • Horas de Treinamento/Mês: {training_data['horas_treinamento_mes']}h
            • Investimento Mensal: R$ {training_data['investimento_mensal']:,.2f}
            • Taxa de Conclusão: {training_data['taxa_conclusao']:.1f}%
            • Satisfação com Treinamentos: {training_data['satisfacao_treinamentos']:.1f}/10
            
            🎯 PROGRAMAS EM ANDAMENTO:
            """
            
            for programa in programas:
                status_icon = "🟢" if programa['conclusao'] >= 85 else "🟡" if programa['conclusao'] >= 70 else "🔴"
                analysis += f"""
            {status_icon} {programa['nome']}
               • {programa['participantes']} participantes
               • {programa['conclusao']:.0f}% conclusão
               • {programa['satisfacao']:.1f}/10 satisfação
            """
            
            # Melhor e pior programa
            best_program = max(programas, key=lambda x: x['satisfacao'])
            worst_completion = min(programas, key=lambda x: x['conclusao'])
            
            analysis += f"""
            
            🏆 MELHOR AVALIADO: {best_program['nome']} ({best_program['satisfacao']:.1f}/10)
            ⚠️  MENOR CONCLUSÃO: {worst_completion['nome']} ({worst_completion['conclusao']:.0f}%)
            
            📋 RECOMENDAÇÕES:
            • Investigar baixa conclusão em "{worst_completion['nome']}"
            • Expandir programa "{best_program['nome']}" para mais pessoas
            • Criar trilhas de desenvolvimento personalizadas
            • Implementar mentoria interna
            • Medir ROI dos treinamentos
            """
            
            return analysis
        
        return Tool(
            name="training_analyzer",
            description="Analisa programas de treinamento e desenvolvimento",
            func=analyze_training
        )
    
    def process_query(self, query: str) -> str:
        """Processa consulta do usuário"""
        task = Task(
            description=f"""
            Analise a seguinte consulta de RH e forneça uma resposta detalhada:
            
            Consulta: {query}
            
            Use as ferramentas disponíveis para:
            1. Analisar dados de RH relevantes
            2. Avaliar métricas de pessoas
            3. Fornecer recomendações estratégicas
            4. Sugerir ações práticas
            
            Responda de forma empática, estratégica e orientada a resultados.
            """,
            agent=self.agent
        )
        
        crew = Crew(
            agents=[self.agent],
            tasks=[task],
            verbose=True
        )
        
        result = crew.kickoff()
        return str(result)

# Exemplo de uso
if __name__ == "__main__":
    agent = RHAgent()
    
    # Teste com consulta exemplo
    query = "Como está o engajamento da equipe e quais ações podemos tomar para melhorar?"
    response = agent.process_query(query)
    print(response)