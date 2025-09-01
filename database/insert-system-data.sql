-- Criação de dados para a tabela crm_column
INSERT INTO crm_columns (name, is_system) VALUES ('Novos Leads', TRUE);
INSERT INTO crm_columns (name, is_system) VALUES ('Qualificados', TRUE);
INSERT INTO crm_columns (name, is_system) VALUES ('Proposta Enviada', TRUE);
INSERT INTO crm_columns (name, is_system) VALUES ('Em Negociação', TRUE);
INSERT INTO crm_columns (name, is_system) VALUES ('Fechados', TRUE);

-- Criação de dados para a tabela service_provider
INSERT INTO service_providers (name, webhook_url) VALUES ('Whatsapp Oficial', '');
INSERT INTO service_providers (name, webhook_url) VALUES ('Whatsapp Evolution', '');
INSERT INTO service_providers (name, webhook_url) VALUES ('Google Calendar', '');

-- Criação de dados para a tabela plan
INSERT INTO plans (name, description, price_month, price_year, active) VALUES ('Starter', 'Description for Basic Plan', 49.00, 490.00, TRUE);
INSERT INTO plans (name, description, price_month, price_year, active) VALUES ('Professional', 'Description for Pro Plan', 149.00, 1490.00, TRUE);
INSERT INTO plans (name, description, price_month, price_year, active) VALUES ('Enterprise', 'Description for Pro Plan', 499.00, 4990.00, TRUE);

-- Criação de dados para a tabela conversation_tag
INSERT INTO conversation_tags (name) VALUES ('Urgente');
INSERT INTO conversation_tags (name) VALUES ('Importante');

-- Criação de dados para a tabela lead_tag
INSERT INTO lead_tags (name) VALUES ('Novo');
INSERT INTO lead_tags (name) VALUES ('Em Negociação');

-- Criação de dados para a tabela job
INSERT INTO jobs (title) VALUES ('Desenvolvedor');
INSERT INTO jobs (title) VALUES ('Gerente de Projetos');
INSERT INTO jobs (title) VALUES ('Administrador');
INSERT INTO jobs (title) VALUES ('Visualizador');

-- Criação de dados para a tabela department
INSERT INTO departments (name, description, manager_name) VALUES ('TI', 'Departamento de Tecnologia da Informação', 'Alice');
INSERT INTO departments (name, description, manager_name) VALUES ('Vendas', 'Departamento de Vendas', 'Bob');
INSERT INTO departments (name, description, manager_name) VALUES ('Marketing', 'Departamento de Marketing', 'Charlie');
INSERT INTO departments (name, description, manager_name) VALUES ('RH', 'Departamento de Recursos Humanos', 'David');

-- Criação de dados para a tabela agent_permission
INSERT INTO agent_permissions (name) VALUES ('Criar Agente');
INSERT INTO agent_permissions (name) VALUES ('Editar Agente');
INSERT INTO agent_permissions (name) VALUES ('Excluir Agente');
INSERT INTO agent_permissions (name) VALUES ('Visualizar Agente');

-- Criação de dados para a tabela crm_permission
INSERT INTO crm_permissions (name) VALUES ('Criar Lead');
INSERT INTO crm_permissions (name) VALUES ('Editar Lead');
INSERT INTO crm_permissions (name) VALUES ('Excluir Lead');
INSERT INTO crm_permissions (name) VALUES ('Visualizar Lead');

-- Criação de dados para a tabela management_permission
INSERT INTO management_permissions (name) VALUES ('Gerenciar Usuários');
INSERT INTO management_permissions (name) VALUES ('Gerenciar Departamentos');
INSERT INTO management_permissions (name) VALUES ('Gerenciar Permissões');
INSERT INTO management_permissions (name) VALUES ('Visualizar Relatórios');

-- Criação de dados para a tabela conversation_permission
INSERT INTO conversation_permissions (name) VALUES ('Visualizar Conversa');
INSERT INTO conversation_permissions (name) VALUES ('Assumir Conversa');
INSERT INTO conversation_permissions (name) VALUES ('Finalizar Conversa');
INSERT INTO conversation_permissions (name) VALUES ('Arquivar Conversa');

-- Criação de dados para a tabela follow_up_trigger
INSERT INTO follow_up_triggers (name) VALUES ('Novo Lead');
INSERT INTO follow_up_triggers (name) VALUES ('Lead Qualificado');
INSERT INTO follow_up_triggers (name) VALUES ('Proposta Enviada');
INSERT INTO follow_up_triggers (name) VALUES ('Pagamento Recebido');
INSERT INTO follow_up_triggers (name) VALUES ('Lembrete de Follow Up');
INSERT INTO follow_up_triggers (name) VALUES ('Aniversário do Cliente');
INSERT INTO follow_up_triggers (name) VALUES ('Gatilho Personalizado');