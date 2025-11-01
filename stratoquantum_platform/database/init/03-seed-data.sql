-- Strato Quantum Platform - Seed Data
-- Insert initial data for development and demo

-- Insert default workspaces
INSERT INTO workspaces.workspaces (id, name, description, icon, color) VALUES
('marketing', 'Marketing', 'Gestão de campanhas, SEO e mídia paga', '📈', 'from-pink-500 to-rose-500'),
('comercial', 'Comercial', 'Gestão de leads, oportunidades e vendas', '💼', 'from-blue-500 to-cyan-500'),
('produto', 'Produto', 'Roadmap, backlog e gestão de produto', '🚀', 'from-purple-500 to-indigo-500'),
('operacoes', 'Operações', 'Processos, SLA e gestão de projetos', '⚙️', 'from-green-500 to-emerald-500'),
('tecnologia', 'Tecnologia', 'Arquitetura, DevOps e segurança', '💻', 'from-cyan-500 to-blue-500'),
('rh', 'Recursos Humanos', 'Gestão de pessoas e recrutamento', '👥', 'from-orange-500 to-red-500'),
('financeiro', 'Financeiro', 'Gestão financeira e contábil', '💰', 'from-yellow-500 to-orange-500')
ON CONFLICT (id) DO NOTHING;

-- Insert workspace modules
INSERT INTO workspaces.modules (workspace_id, module_id, name, description) VALUES
-- Marketing modules
('marketing', 'campanhas', 'Campanhas', 'Gestão de campanhas de marketing'),
('marketing', 'seo-conteudo', 'SEO & Conteúdo', 'Otimização e criação de conteúdo'),
('marketing', 'midia-paga', 'Mídia Paga', 'Campanhas pagas e ROI'),
('marketing', 'calendario', 'Calendário', 'Planejamento de conteúdo'),
('marketing', 'relatorios', 'Relatórios', 'Analytics e métricas'),

-- Comercial modules
('comercial', 'leads', 'Leads', 'Gestão de leads e prospects'),
('comercial', 'oportunidades', 'Oportunidades', 'Pipeline de vendas'),
('comercial', 'propostas', 'Propostas', 'Criação e acompanhamento'),
('comercial', 'funil', 'Funil', 'Análise do funil de vendas'),
('comercial', 'relatorios', 'Relatórios', 'Performance comercial'),

-- Produto modules
('produto', 'roadmap', 'Roadmap', 'Planejamento de produto'),
('produto', 'backlog', 'Backlog', 'Gestão de funcionalidades'),
('produto', 'feedbacks', 'Feedbacks', 'Feedback dos usuários'),
('produto', 'analytics', 'Analytics', 'Métricas de uso'),
('produto', 'lancamentos', 'Lançamentos', 'Gestão de releases'),

-- Operações modules
('operacoes', 'sla-incidentes', 'SLA & Incidentes', 'Gestão de incidentes'),
('operacoes', 'runbooks', 'Runbooks', 'Procedimentos operacionais'),
('operacoes', 'projetos', 'Projetos', 'Gestão de projetos'),
('operacoes', 'inventario', 'Inventário', 'Controle de ativos'),
('operacoes', 'relatorios', 'Relatórios', 'Métricas operacionais'),

-- Tecnologia modules
('tecnologia', 'arquitetura', 'Arquitetura', 'Arquitetura de sistemas'),
('tecnologia', 'ci-cd', 'CI/CD', 'Pipeline de desenvolvimento'),
('tecnologia', 'observabilidade', 'Observabilidade', 'Monitoramento e logs'),
('tecnologia', 'pesquisa', 'P&D', 'Pesquisa e desenvolvimento'),
('tecnologia', 'seguranca', 'Segurança', 'Segurança da informação'),

-- RH modules
('rh', 'vagas', 'Vagas', 'Recrutamento e seleção'),
('rh', 'onboarding', 'Onboarding', 'Integração de colaboradores'),
('rh', 'politicas', 'Políticas', 'Políticas e procedimentos'),
('rh', 'treinamentos', 'Treinamentos', 'Capacitação e desenvolvimento'),
('rh', 'avaliacoes', 'Avaliações', 'Avaliação de desempenho'),

-- Financeiro modules
('financeiro', 'contas', 'Contas', 'Contas a pagar e receber'),
('financeiro', 'faturamento', 'Faturamento', 'Gestão de faturamento'),
('financeiro', 'forecast', 'Forecast', 'Projeções financeiras'),
('financeiro', 'custos', 'Custos', 'Controle de custos'),
('financeiro', 'relatorios', 'Relatórios', 'Relatórios financeiros')
ON CONFLICT (workspace_id, module_id) DO NOTHING;

-- Insert AI agents
INSERT INTO agents.agents (id, name, short_name, description, workspace_id, capabilities) VALUES
('financeiro-ai', 'Agente Financeiro', 'F', 'Especialista em análise financeira, fluxo de caixa e previsões', 'financeiro', 
 '["cash_flow_analysis", "budget_analysis", "roi_calculation", "financial_forecast"]'),
('rh-ai', 'Agente RH', 'RH', 'Especialista em gestão de pessoas, recrutamento e desenvolvimento', 'rh',
 '["recruitment_analysis", "performance_analysis", "culture_analysis", "training_analysis"]'),
('tecnologia-ai', 'Agente Tecnologia', 'T', 'Especialista em arquitetura, DevOps e segurança', 'tecnologia',
 '["architecture_review", "security_analysis", "performance_optimization", "code_review"]'),
('operacoes-ai', 'Agente Operações', 'O', 'Especialista em processos, SLA e gestão de projetos', 'operacoes',
 '["process_optimization", "sla_monitoring", "project_management", "incident_analysis"]'),
('comercial-ai', 'Agente Comercial', 'C', 'Especialista em vendas, CRM e pipeline', 'comercial',
 '["lead_qualification", "sales_forecast", "pipeline_analysis", "conversion_optimization"]'),
('produto-ai', 'Agente Produto', 'P', 'Especialista em roadmap, features e feedback', 'produto',
 '["feature_prioritization", "user_feedback_analysis", "roadmap_planning", "usage_analytics"]'),
('marketing-ai', 'Agente Marketing', 'M', 'Especialista em campanhas, SEO e performance', 'marketing',
 '["campaign_optimization", "seo_analysis", "content_strategy", "roi_analysis"]')
ON CONFLICT (id) DO NOTHING;

-- Insert demo user
INSERT INTO auth.users (id, email, password_hash, name, role, is_active, email_verified) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'demo@stratoquantum.com', 
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: "password"
 'Demo User', 'admin', true, true),
('550e8400-e29b-41d4-a716-446655440001', 'user@stratoquantum.com',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: "password"
 'Regular User', 'user', true, true)
ON CONFLICT (email) DO NOTHING;

-- Grant workspace access to demo users
INSERT INTO workspaces.user_access (user_id, workspace_id, role, granted_by) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'marketing', 'admin', '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440000', 'comercial', 'admin', '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440000', 'produto', 'admin', '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440000', 'operacoes', 'admin', '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440000', 'tecnologia', 'admin', '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440000', 'rh', 'admin', '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440000', 'financeiro', 'admin', '550e8400-e29b-41d4-a716-446655440000'),

('550e8400-e29b-41d4-a716-446655440001', 'marketing', 'editor', '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440001', 'comercial', 'editor', '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440001', 'produto', 'viewer', '550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT (user_id, workspace_id) DO NOTHING;

-- Insert sample team conversations for demo
INSERT INTO chat.team_conversations (id, name, type, participants) VALUES
('550e8400-e29b-41d4-a716-446655440100', 'Equipe Principal', 'group', 
 '["550e8400-e29b-41d4-a716-446655440000", "hacker", "hipster", "marketing"]'),
('550e8400-e29b-41d4-a716-446655440101', 'Chat com Hacker', 'direct',
 '["550e8400-e29b-41d4-a716-446655440000", "hacker"]'),
('550e8400-e29b-41d4-a716-446655440102', 'Chat com Hipster', 'direct',
 '["550e8400-e29b-41d4-a716-446655440000", "hipster"]'),
('550e8400-e29b-41d4-a716-446655440103', 'Chat com Marketing', 'direct',
 '["550e8400-e29b-41d4-a716-446655440000", "marketing"]')
ON CONFLICT (id) DO NOTHING;

-- Insert sample team messages
INSERT INTO chat.team_messages (conversation_id, sender_id, sender_type, message_text, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440101', 'marketing', 'persona', 
 'CAC diminuiu 25% com a nova estratégia! 🎉', NOW() - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440000', 'user',
 'Excelente! Qual foi o driver principal?', NOW() - INTERVAL '2 hours' + INTERVAL '2 minutes'),
('550e8400-e29b-41d4-a716-446655440101', 'marketing', 'persona',
 'Otimização da landing page + segmentação melhor no ads', NOW() - INTERVAL '2 hours' + INTERVAL '5 minutes'),

('550e8400-e29b-41d4-a716-446655440102', 'hipster', 'persona',
 'Fiz uns testes de usabilidade, tenho insights interessantes', NOW() - INTERVAL '30 minutes'),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440000', 'user',
 'Conta aí! O que descobriu?', NOW() - INTERVAL '28 minutes'),
('550e8400-e29b-41d4-a716-446655440102', 'hipster', 'persona',
 'Usuários se confundem no step 3 do onboarding. Vou redesenhar', NOW() - INTERVAL '25 minutes'),

('550e8400-e29b-41d4-a716-446655440103', 'hacker', 'persona',
 'Deploy realizado com sucesso, tudo funcionando ✅', NOW() - INTERVAL '10 minutes'),
('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440000', 'user',
 'Perfeito! Performance melhorou?', NOW() - INTERVAL '8 minutes'),
('550e8400-e29b-41d4-a716-446655440103', 'hacker', 'persona',
 'Implementei a otimização, performance melhorou 40%', NOW() - INTERVAL '5 minutes')
ON CONFLICT DO NOTHING;