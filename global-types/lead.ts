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
  tags: LeadTag[];
}

export interface LeadTag extends BaseInterface {
  id: number;
  name: string;
}