import { BaseInterface } from ".";

export interface User extends BaseInterface {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  jobId: number;
  locationName: string;
  language: string;
  timezone: string;
  status: 'active' | 'inactive' | 'suspended';
  departmentId: number;
  agentPermissions: AgentPermission[];
  crmPermissions: CrmPermission[];
  conversationPermissions: ConversationPermission[];
  managementPermissions: ManagementPermission[];
}

export interface Job extends BaseInterface {
  id: number;
  title: string;
}

export interface Department extends BaseInterface {
  id: number;
  name: string;
  description: string;
  managerName: string;
}

export interface AgentPermission extends BaseInterface {
  id: number;
  name: string;
}

export interface CrmPermission extends BaseInterface {
  id: number;
  name: string;
}

export interface ConversationPermission extends BaseInterface {
  id: number;
  name: string;
}

export interface ManagementPermission extends BaseInterface {
  id: number;
  name: string;
}