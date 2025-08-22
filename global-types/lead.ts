export interface Lead {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  value: number;
  source: 'whatsapp' | 'email' | 'website' | 'phone' | 'referral';
  priority: 'low' | 'medium' | 'high';
  observation: string;
}

export interface LeadTag {
  id: number;
  name: string;
}