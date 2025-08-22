export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  organizationName: string;
  job: Job;
  locationName: string;
  language: string;
  timezone: string;
  status: 'active' | 'inactive' | 'suspended';
  department: Department;
  agentPermissions: AgentPermission[];
  crmPermissions: CrmPermission[];
  conversationPermissions: ConversationPermission[];
  managementPermissions: ManagementPermission[];
}

export interface Job {
  id: number;
  title: string;
}

export interface Department {
  id: number;
  name: string;
  description: string;
  managerName: string;
}

export interface AgentPermission {
  id: number;
  name: string;
}

export interface CrmPermission {
  id: number;
  name: string;
}

export interface ConversationPermission {
  id: number;
  name: string;
}

export interface ManagementPermission {
  id: number;
  name: string;
}