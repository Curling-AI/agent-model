import { BaseInterface } from ".";

export interface Lead extends BaseInterface{
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  value: number;
  source: 'whatsapp' | 'email' | 'website' | 'phone' | 'referral';
  priority: 'low' | 'medium' | 'high';
  observation: string;
  status: number;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
  archivedAt?: string;
}

export interface LeadTag extends BaseInterface {
  id: number;
  name: string;
}

export interface LeadCRMHistory extends BaseInterface {
  id: number;
  lead: Lead;
  oldStatus: number;
  newStatus: number;
  createdAt: string;
  agentId: number;
}