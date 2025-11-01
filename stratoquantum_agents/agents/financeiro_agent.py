"""
Strato Quantum - Agente Financeiro
Especializado em análise financeira, fluxo de caixa e previsões
"""

from crewai import Agent, Task, Crew
from langchain.tools import Tool
from typing import Dict, List, Any
import json
from datetime import datetime, timedelta

class FinanceiroAgent:
    def __init__(self):
        self.agent = Agent(
            role='Especialista Financeiro',
            goal='Analisar dados financeiros e fornecer insights estratégicos para tomada de decisão',
            backstory="""
            Sou um especialista em finanças corporativas com mais de 15 anos de experiência.
            Minha expertise inclui análise de fluxo de caixa, projeções financeiras, 
            gestão de riscos e otimização de custos. Utilizo dados em tempo real para 
            fornecer recomendações precisas e acionáveis.
            """,
            verbose=True,
            allow_delegation=False,
            tools=[
                self._create_cash_flow_tool(),
                self._create_budget_analysis_tool(),
                self._create_roi_calculator_tool(),
                self._create_forecast_tool()
            ]
        )
    
    def _create_cash_flow_tool(self) -> Tool:
        def analyze_cash_flow(period: str = "monthly") -> str:
            """Analisa o fluxo de caixa para o período especificado"""
            # Mock data - será substituído por dados reais
            mock_data = {
                "receitas": 127000,
                "despesas": 89000,
                "saldo_liquido": 38000,
                "contas_receber": 45200,
                "contas_pagar": 31800,
                "vencimentos_hoje": 15
            }
            
            analysis = f"""
            📊 ANÁLISE DE FLUXO DE CAIXA ({period.upper()})
            
            💰 Receitas: R$ {mock_data['receitas']:,.2f}
            💸 Despesas: R$ {mock_data['despesas']:,.2f}
            📈 Saldo Líquido: R$ {mock_data['saldo_liquido']:,.2f}
            
            🔄 CONTAS A RECEBER: R$ {mock_data['contas_receber']:,.2f}
            🔄 CONTAS A PAGAR: R$ {mock_data['contas_pagar']:,.2f}
            ⚠️  VENCIMENTOS HOJE: {mock_data['vencimentos_hoje']} contas
            
            📋 RECOMENDAÇÕES:
            • Priorizar cobrança das contas em atraso
            • Negociar prazos com fornecedores principais
            • Manter reserva de emergência de 3 meses
            """
            return analysis
        
        return Tool(
            name="cash_flow_analyzer",
            description="Analisa fluxo de caixa e fornece insights financeiros",
            func=analyze_cash_flow
        )
    
    def _create_budget_analysis_tool(self) -> Tool:
        def analyze_budget(department: str = "all") -> str:
            """Analisa orçamento por departamento"""
            mock_budgets = {
                "marketing": {"orcado": 50000, "gasto": 32000, "variacao": -36},
                "tecnologia": {"orcado": 80000, "gasto": 85000, "variacao": 6.25},
                "operacoes": {"orcado": 60000, "gasto": 58000, "variacao": -3.33},
                "rh": {"orcado": 40000, "gasto": 38500, "variacao": -3.75}
            }
            
            if department != "all" and department in mock_budgets:
                data = mock_budgets[department]
                return f"""
                📊 ANÁLISE ORÇAMENTÁRIA - {department.upper()}
                
                💰 Orçado: R$ {data['orcado']:,.2f}
                💸 Gasto: R$ {data['gasto']:,.2f}
                📈 Variação: {data['variacao']:.1f}%
                
                Status: {"⚠️ Acima do orçamento" if data['variacao'] > 0 else "✅ Dentro do orçamento"}
                """
            
            total_orcado = sum(d['orcado'] for d in mock_budgets.values())
            total_gasto = sum(d['gasto'] for d in mock_budgets.values())
            
            return f"""
            📊 ANÁLISE ORÇAMENTÁRIA GERAL
            
            💰 Total Orçado: R$ {total_orcado:,.2f}
            💸 Total Gasto: R$ {total_gasto:,.2f}
            📈 Variação Geral: {((total_gasto - total_orcado) / total_orcado * 100):.1f}%
            
            🏆 MELHOR PERFORMANCE: RH (-3.75%)
            ⚠️  ATENÇÃO: Tecnologia (+6.25%)
            """
        
        return Tool(
            name="budget_analyzer",
            description="Analisa performance orçamentária por departamento",
            func=analyze_budget
        )
    
    def _create_roi_calculator_tool(self) -> Tool:
        def calculate_roi(investment: float, return_value: float, period_months: int = 12) -> str:
            """Calcula ROI de investimentos"""
            roi_percentage = ((return_value - investment) / investment) * 100
            monthly_roi = roi_percentage / period_months
            
            return f"""
            📈 CÁLCULO DE ROI
            
            💰 Investimento: R$ {investment:,.2f}
            💵 Retorno: R$ {return_value:,.2f}
            📊 ROI: {roi_percentage:.2f}%
            📅 ROI Mensal: {monthly_roi:.2f}%
            
            📋 ANÁLISE:
            {"🟢 Investimento EXCELENTE" if roi_percentage > 20 else 
             "🟡 Investimento BOM" if roi_percentage > 10 else 
             "🔴 Investimento BAIXO"}
            """
        
        return Tool(
            name="roi_calculator",
            description="Calcula ROI de investimentos e projetos",
            func=calculate_roi
        )
    
    def _create_forecast_tool(self) -> Tool:
        def generate_forecast(months: int = 6) -> str:
            """Gera projeção financeira"""
            base_revenue = 127000
            growth_rate = 0.08  # 8% ao mês
            
            projections = []
            for i in range(1, months + 1):
                projected_revenue = base_revenue * (1 + growth_rate) ** i
                projections.append({
                    "month": i,
                    "revenue": projected_revenue,
                    "expenses": projected_revenue * 0.7,  # 70% de custos
                    "profit": projected_revenue * 0.3
                })
            
            forecast_text = f"""
            🔮 PROJEÇÃO FINANCEIRA ({months} MESES)
            
            📈 Taxa de Crescimento Estimada: {growth_rate*100:.1f}% a.m.
            
            """
            
            for proj in projections:
                forecast_text += f"""
            MÊS {proj['month']}:
            💰 Receita: R$ {proj['revenue']:,.0f}
            💸 Custos: R$ {proj['expenses']:,.0f}
            📊 Lucro: R$ {proj['profit']:,.0f}
            """
            
            total_profit = sum(p['profit'] for p in projections)
            forecast_text += f"""
            
            🎯 LUCRO TOTAL PROJETADO: R$ {total_profit:,.0f}
            """
            
            return forecast_text
        
        return Tool(
            name="financial_forecast",
            description="Gera projeções financeiras baseadas em tendências",
            func=generate_forecast
        )
    
    def process_query(self, query: str) -> str:
        """Processa consulta do usuário"""
        task = Task(
            description=f"""
            Analise a seguinte consulta financeira e forneça uma resposta detalhada:
            
            Consulta: {query}
            
            Use as ferramentas disponíveis para:
            1. Analisar dados financeiros relevantes
            2. Calcular métricas importantes
            3. Fornecer recomendações acionáveis
            4. Apresentar insights estratégicos
            
            Responda de forma clara, objetiva e profissional.
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
    agent = FinanceiroAgent()
    
    # Teste com consulta exemplo
    query = "Como está nosso fluxo de caixa este mês e quais são as principais recomendações?"
    response = agent.process_query(query)
    print(response)