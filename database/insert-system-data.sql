-- Criação de dados para a tabela crm_column
INSERT INTO crm_columns (id, title_pt, title_en, is_system, color, order) VALUES (1, 'Novos Leads', 'New Leads', TRUE, '#229ad2', 1);
INSERT INTO crm_columns (id, title_pt, title_en, is_system, color, order) VALUES (2, 'Qualificados', 'Qualified', TRUE, '#22d2a2', 2);
INSERT INTO crm_columns (id, title_pt, title_en, is_system, color, order) VALUES (3, 'Proposta Enviada', 'Proposal Sent', TRUE, '#5a22d2', 3);
INSERT INTO crm_columns (id, title_pt, title_en, is_system, color, order) VALUES (4, 'Em Negociação', 'In Negotiation', TRUE, '#d222a2', 4);
INSERT INTO crm_columns (id, title_pt, title_en, is_system, color, order) VALUES (5, 'Fechados', 'Closed', TRUE, '#a2d222', 5);

-- Criação de dados para a tabela service_provider
INSERT INTO service_providers (name, description_pt, description_en) VALUES ('Whatsapp Oficial', 'Conexão direta com WhatsApp Business API oficial', 'Official WhatsApp Business API connection');
INSERT INTO service_providers (name, description_pt, description_en) VALUES ('Whatsapp Evolution', 'Conexão via Evolution API para WhatsApp', 'Connection via Evolution API for WhatsApp');
INSERT INTO service_providers (name, description_pt, description_en) VALUES ('Google Calendar', 'Aplicação de integração com Google Calendar', 'Google Calendar integration application');

-- Criação de dados para a tabela plan
INSERT INTO plans (name, description, price_month, price_year, active) VALUES ('Starter', 'Description for Basic Plan', 49.00, 490.00, TRUE);
INSERT INTO plans (name, description, price_month, price_year, active) VALUES ('Professional', 'Description for Pro Plan', 149.00, 1490.00, TRUE);
INSERT INTO plans (name, description, price_month, price_year, active) VALUES ('Enterprise', 'Description for Pro Plan', 499.00, 4990.00, TRUE);

-- Criação de dados para a tabela conversation_tag
INSERT INTO conversation_tags (name) VALUES ('Urgente');
INSERT INTO conversation_tags (name) VALUES ('Importante');

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
INSERT INTO permissions (group_id, group_name_pt, group_name_en, code, description_pt, description_en) VALUES (1, 'Permissões de Agente', 'Agent Permissions', 'createAgent', 'Criar Agente', 'Create Agent');
INSERT INTO permissions (group_id, group_name_pt, group_name_en, code, description_pt, description_en) VALUES (1, 'Permissões de Agente', 'Agent Permissions', 'editAgent', 'Editar Agente', 'Edit Agent');
INSERT INTO permissions (group_id, group_name_pt, group_name_en, code, description_pt, description_en) VALUES (1, 'Permissões de Agente', 'Agent Permissions', 'deleteAgent', 'Excluir Agente', 'Delete Agent');
INSERT INTO permissions (group_id, group_name_pt, group_name_en, code, description_pt, description_en) VALUES (1, 'Permissões de Agente', 'Agent Permissions', 'viewAgent', 'Visualizar Agente', 'View Agent');
INSERT INTO permissions (group_id, group_name_pt, group_name_en, code, description_pt, description_en) VALUES (2, 'Permissões de CRM', 'CRM Permissions', 'createLead', 'Criar Lead', 'Create Lead');
INSERT INTO permissions (group_id, group_name_pt, group_name_en, code, description_pt, description_en) VALUES (2, 'Permissões de CRM', 'CRM Permissions', 'editLead', 'Editar Lead', 'Edit Lead');
INSERT INTO permissions (group_id, group_name_pt, group_name_en, code, description_pt, description_en) VALUES (2, 'Permissões de CRM', 'CRM Permissions', 'deleteLead', 'Excluir Lead', 'Delete Lead');
INSERT INTO permissions (group_id, group_name_pt, group_name_en, code, description_pt, description_en) VALUES (2, 'Permissões de CRM', 'CRM Permissions', 'viewLead', 'Visualizar Lead', 'View Lead');
INSERT INTO permissions (group_id, group_name_pt, group_name_en, code, description_pt, description_en) VALUES (3, 'Permissões de Conversa', 'Conversation Permissions', 'manageUsers', 'Gerenciar Usuários', 'Manage Users');
INSERT INTO permissions (group_id, group_name_pt, group_name_en, code, description_pt, description_en) VALUES (3, 'Permissões de Conversa', 'Conversation Permissions', 'manageDepartments', 'Gerenciar Departamentos', 'Manage Departments');
INSERT INTO permissions (group_id, group_name_pt, group_name_en, code, description_pt, description_en) VALUES (3, 'Permissões de Conversa', 'Conversation Permissions', 'managePermissions', 'Gerenciar Permissões', 'Manage Permissions');
INSERT INTO permissions (group_id, group_name_pt, group_name_en, code, description_pt, description_en) VALUES (3, 'Permissões de Conversa', 'Conversation Permissions', 'viewReports', 'Visualizar Relatórios', 'View Reports');
INSERT INTO permissions (group_id, group_name_pt, group_name_en, code, description_pt, description_en) VALUES (4, 'Permissões de Administração', 'Administration Permissions', 'viewConversations', 'Visualizar Conversas', 'View Conversations');
INSERT INTO permissions (group_id, group_name_pt, group_name_en, code, description_pt, description_en) VALUES (4, 'Permissões de Administração', 'Administration Permissions', 'takeConversations', 'Assumir Conversas', 'Take Conversations');
INSERT INTO permissions (group_id, group_name_pt, group_name_en, code, description_pt, description_en) VALUES (4, 'Permissões de Administração', 'Administration Permissions', 'finishConversations', 'Finalizar Conversas', 'Finish Conversations');
INSERT INTO permissions (group_id, group_name_pt, group_name_en, code, description_pt, description_en) VALUES (4, 'Permissões de Administração', 'Administration Permissions', 'archiveConversations', 'Arquivar Conversas', 'Archive Conversations');

-- Criação de dados para a tabela follow_up_trigger
INSERT INTO follow_up_triggers (name) VALUES ('Novo Lead');
INSERT INTO follow_up_triggers (name) VALUES ('Lead Qualificado');
INSERT INTO follow_up_triggers (name) VALUES ('Proposta Enviada');
INSERT INTO follow_up_triggers (name) VALUES ('Pagamento Recebido');
INSERT INTO follow_up_triggers (name) VALUES ('Lembrete de Follow Up');
INSERT INTO follow_up_triggers (name) VALUES ('Aniversário do Cliente');
INSERT INTO follow_up_triggers (name) VALUES ('Gatilho Personalizado');