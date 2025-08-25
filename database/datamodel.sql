-- Tabela Organization
CREATE TABLE organization (
  id serial PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  credit NUMERIC NOT NULL,
  payment_token VARCHAR(255)
);

-- Tabela CrmColumn
CREATE TABLE crm_column (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NULL,
  name VARCHAR(255) NOT NULL,
  is_system BOOLEAN NOT NULL DEFAULT FALSE
);

-- Tabela ServiceProvider
CREATE TABLE service_provider (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  webhook_url VARCHAR(255)
);

-- Tabela Plan
CREATE TABLE plan (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price_month NUMERIC NOT NULL,
  price_year NUMERIC NOT NULL,
  active BOOLEAN NOT NULL
);

-- Tabela PlanFeature (relaciona features do plano)
CREATE TABLE plan_feature (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER REFERENCES plan(id) ON DELETE CASCADE,
  feature VARCHAR(255) NOT NULL
);

-- Tabela Agent
CREATE TABLE agent (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  active BOOLEAN NOT NULL,
  description TEXT,
  greetings TEXT,
  tone VARCHAR(255),
  voice_configuration VARCHAR(255),
  response_time INTEGER CHECK (response_time IN (0, 1, 5, 15)),
  schedule_agent_begin VARCHAR(255),
  schedule_agent_end VARCHAR(255)
);

-- Tabela AgentPrompt
CREATE TABLE agent_prompt (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES agent(id) ON DELETE CASCADE,
  type VARCHAR(20) CHECK (type IN ('simple', 'advanced')),
  prompt TEXT NOT NULL
);

-- Tabela AgentDocument
CREATE TABLE agent_document (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES agent(id) ON DELETE CASCADE,
  type VARCHAR(20) CHECK (type IN ('file', 'faq', 'video')),
  name VARCHAR(255) NOT NULL,
  content TEXT
);

-- Tabela Agent_ServiceProvider (relacionamento entre Agent e ServiceProvider)
CREATE TABLE agent_service_provider (
  agent_id INTEGER REFERENCES agent(id) ON DELETE CASCADE,
  service_provider_id INTEGER REFERENCES service_provider(id) ON DELETE CASCADE,
  PRIMARY KEY (agent_id, service_provider_id)
);

-- Tabela FollowUpTrigger
CREATE TABLE follow_up_trigger (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NULL,
  name VARCHAR(255) NOT NULL
);

-- Tabela FollowUp
CREATE TABLE follow_up (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES agent(id) ON DELETE CASCADE,
  organization_id INTEGER REFERENCES organization(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  crm_column_id INTEGER REFERENCES crm_column(id),
  trigger_id INTEGER REFERENCES follow_up_trigger(id),
  description TEXT
);

-- Tabela MessageSequence
CREATE TABLE message_sequence (
  id SERIAL PRIMARY KEY,
  follow_up_id INTEGER REFERENCES follow_up(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  days INTEGER NOT NULL DEFAULT 0,
  hours INTEGER NOT NULL DEFAULT 0,
  minutes INTEGER NOT NULL DEFAULT 0
);

-- Tabela MessageSequenceDocument
CREATE TABLE message_sequence_document (
  id SERIAL PRIMARY KEY,
  message_sequence_id INTEGER REFERENCES message_sequence(id) ON DELETE CASCADE,
  url VARCHAR(255) NOT NULL
);

-- Tabela Conversation
CREATE TABLE conversation (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL,
  agent_id INTEGER REFERENCES agent(id) ON DELETE SET NULL,
  lead_id INTEGER NOT NULL
);

-- Tabela ConversationMessage
CREATE TABLE conversation_message (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversation(id) ON DELETE CASCADE,
  sender VARCHAR(10) CHECK (sender IN ('human', 'agent')),
  content TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL
);

-- Tabela ConversationTag
CREATE TABLE conversation_tag (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NULL,
  name VARCHAR(255) NOT NULL
);

-- Associação entre Conversation e ConversationTag
CREATE TABLE conversation_tag_association (
  conversation_id INTEGER REFERENCES conversation(id) ON DELETE CASCADE,
  conversation_tag_id INTEGER REFERENCES conversation_tag(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, conversation_tag_id)
);

-- Tabela Lead
CREATE TABLE lead (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  value NUMERIC NOT NULL,
  source VARCHAR(20) CHECK (source IN ('whatsapp', 'email', 'website', 'phone', 'referral')),
  priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high')),
  observation TEXT
);

-- Tabela LeadTag
CREATE TABLE lead_tag (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NULL,
  name VARCHAR(255) NOT NULL
);

-- Associação entre Lead e LeadTag
CREATE TABLE lead_tag_association (
  lead_id INTEGER REFERENCES lead(id) ON DELETE CASCADE,
  lead_tag_id INTEGER REFERENCES lead_tag(id) ON DELETE CASCADE,
  PRIMARY KEY (lead_id, lead_tag_id)
);

-- Tabela Job
CREATE TABLE job (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NULL,
  title VARCHAR(255) NOT NULL
);

-- Tabela Department
CREATE TABLE department (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  manager_name VARCHAR(255)
);

-- Tabela User
CREATE TABLE "user" (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  surname VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  job_id INTEGER REFERENCES job(id),
  location_name VARCHAR(255),
  language VARCHAR(50),
  timezone VARCHAR(50),
  status VARCHAR(10) CHECK (status IN ('active', 'inactive', 'suspended')),
  department_id INTEGER REFERENCES department(id)
);

-- Tabela AgentPermission
CREATE TABLE agent_permission (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NULL,
  name VARCHAR(255) NOT NULL
);

-- Tabela CrmPermission
CREATE TABLE crm_permission (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NULL,
  name VARCHAR(255) NOT NULL
);

-- Tabela ConversationPermission
CREATE TABLE conversation_permission (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NULL,
  name VARCHAR(255) NOT NULL
);

-- Tabela ManagementPermission
CREATE TABLE management_permission (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NULL,
  name VARCHAR(255) NOT NULL
);

-- Associação entre User e AgentPermission
CREATE TABLE user_agent_permission (
  user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
  agent_permission_id INTEGER REFERENCES agent_permission(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, agent_permission_id)
);

-- Associação entre User e CrmPermission
CREATE TABLE user_crm_permission (
  user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
  crm_permission_id INTEGER REFERENCES crm_permission(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, crm_permission_id)
);

-- Associação entre User e ConversationPermission
CREATE TABLE user_conversation_permission (
  user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
  conversation_permission_id INTEGER REFERENCES conversation_permission(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, conversation_permission_id)
);

-- Associação entre User e ManagementPermission
CREATE TABLE user_management_permission (
  user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
  management_permission_id INTEGER REFERENCES management_permission(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, management_permission_id)
);