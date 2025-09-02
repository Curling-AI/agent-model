-- Tabela Organization
CREATE TABLE organizations (
  id serial PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  credit NUMERIC NOT NULL,
  payment_token VARCHAR(255),
  created_at TIMESTAMP WITH ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH ZONE DEFAULT now()
);

-- Tabela CrmColumn
CREATE TABLE crm_columns (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NULL,
  name VARCHAR(255) NOT NULL,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH ZONE DEFAULT now()
);

-- Tabela ServiceProvider
CREATE TABLE service_providers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  webhook_url VARCHAR(255),
  created_at TIMESTAMP WITH ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH ZONE DEFAULT now()
);

-- Tabela Plan
CREATE TABLE plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price_month NUMERIC NOT NULL,
  price_year NUMERIC NOT NULL,
  active BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH ZONE DEFAULT now()
);

-- Tabela PlanFeature (relaciona features do plano)
CREATE TABLE plan_features (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER REFERENCES plans(id) ON DELETE CASCADE,
  feature VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH ZONE DEFAULT now()
);

-- Tabela Agent
CREATE TABLE agents (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT 1,
  description TEXT,
  greetings TEXT,
  tone VARCHAR(255),
  voice_configuration VARCHAR(255),
  response_time INTEGER CHECK (response_time IN (0, 1, 5, 15)),
  schedule_agent_begin VARCHAR(255),
  schedule_agent_end VARCHAR(255),
  type VARCHAR(20) CHECK (type IN ('simple', 'advanced')),
  prompt TEXT NOT NULL,
  created_at TIMESTAMP WITH ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH ZONE DEFAULT now()
);

-- Tabela Document
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE,
  type VARCHAR(20) CHECK (type IN ('file', 'faq', 'video', 'website')),
  name VARCHAR(255) NOT NULL,
  content jsonb,
  created_at TIMESTAMP WITH ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH ZONE DEFAULT now()
);

-- Tabela Agent_ServiceProvider (relacionamento entre Agent e ServiceProvider)
CREATE TABLE agent_service_providers (
  agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE,
  service_provider_id INTEGER REFERENCES service_providers(id) ON DELETE CASCADE,
  PRIMARY KEY (agent_id, service_provider_id),
  created_at TIMESTAMP WITH ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH ZONE DEFAULT now()
);

-- Tabela FollowUpTrigger
CREATE TABLE follow_up_triggers (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH ZONE DEFAULT now()
);

-- Tabela FollowUp
CREATE TABLE follow_ups (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  crm_column_id INTEGER REFERENCES crm_columns(id),
  trigger_id INTEGER REFERENCES follow_up_triggers(id),
  description TEXT,
  created_at TIMESTAMP WITH ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH ZONE DEFAULT now()
);

-- Tabela MessageSequence
CREATE TABLE message_sequences (
  id SERIAL PRIMARY KEY,
  follow_up_id INTEGER REFERENCES follow_ups(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  days INTEGER NOT NULL DEFAULT 0,
  hours INTEGER NOT NULL DEFAULT 0,
  minutes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH ZONE DEFAULT now()
);

-- Tabela MessageSequenceDocument
CREATE TABLE message_sequence_documents (
  id SERIAL PRIMARY KEY,
  message_sequence_id INTEGER REFERENCES message_sequences(id) ON DELETE CASCADE,
  url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH ZONE DEFAULT now()
);

-- Tabela Conversation
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL,
  agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
  lead_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH ZONE DEFAULT now()
);

-- Tabela ConversationMessage
CREATE TABLE conversation_messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
  sender VARCHAR(10) CHECK (sender IN ('human', 'agent')),
  content TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP WITH ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH ZONE DEFAULT now()
);

-- Tabela ConversationTag
CREATE TABLE conversation_tags (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH ZONE DEFAULT now()
);

-- Associação entre Conversation e ConversationTag
CREATE TABLE conversation_tag_associations (
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
  conversation_tag_id INTEGER REFERENCES conversation_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, conversation_tag_id),
  created_at TIMESTAMP WITH ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH ZONE DEFAULT now()
);

-- Tabela Lead
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  value NUMERIC NOT NULL,
  source VARCHAR(20) CHECK (source IN ('whatsapp', 'email', 'website', 'phone', 'referral')),
  priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high')),
  observation TEXT,
  created_at TIMESTAMP WITH ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH ZONE DEFAULT now()
);

-- Tabela Job
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NULL,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH ZONE DEFAULT now()
);

-- Tabela Department
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  manager_name VARCHAR(255),
  created_at TIMESTAMP WITH ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH ZONE DEFAULT now()
);

-- Tabela User
CREATE TABLE "users" (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  surname VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  job_id INTEGER REFERENCES jobs(id),
  location_name VARCHAR(255),
  language VARCHAR(50),
  timezone VARCHAR(50),
  status VARCHAR(10) CHECK (status IN ('active', 'inactive', 'suspended')),
  department_id INTEGER REFERENCES departments(id),
  created_at TIMESTAMP WITH ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH ZONE DEFAULT now()
);

-- Tabela AgentPermission
CREATE TABLE agent_permissions (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH ZONE DEFAULT now()  
);

-- Tabela CrmPermission
CREATE TABLE crm_permissions (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH ZONE DEFAULT now()
);

-- Tabela ConversationPermission
CREATE TABLE conversation_permissions (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH ZONE DEFAULT now()
);

-- Tabela ManagementPermission
CREATE TABLE management_permissions (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH ZONE DEFAULT now()
);

-- Associação entre User e AgentPermission
CREATE TABLE user_agent_permissions (
  user_id INTEGER REFERENCES "users"(id) ON DELETE CASCADE,
  agent_permission_id INTEGER REFERENCES agent_permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, agent_permission_id),
  created_at TIMESTAMP WITH ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH ZONE DEFAULT now()
);

-- Associação entre User e CrmPermission
CREATE TABLE user_crm_permissions (
  user_id INTEGER REFERENCES "users"(id) ON DELETE CASCADE,
  crm_permission_id INTEGER REFERENCES crm_permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, crm_permission_id),
  created_at TIMESTAMP WITH ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH ZONE DEFAULT now()
);

-- Associação entre User e ConversationPermission
CREATE TABLE user_conversation_permissions (
  user_id INTEGER REFERENCES "users"(id) ON DELETE CASCADE,
  conversation_permission_id INTEGER REFERENCES conversation_permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, conversation_permission_id),
  created_at TIMESTAMP WITH ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH ZONE DEFAULT now()
);

-- Associação entre User e ManagementPermission
CREATE TABLE user_management_permissions (
  user_id INTEGER REFERENCES "users"(id) ON DELETE CASCADE,
  management_permission_id INTEGER REFERENCES management_permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, management_permission_id),
  created_at TIMESTAMP WITH ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH ZONE DEFAULT now()
);