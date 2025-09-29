export interface Organization {
  id: string;
  name: string;
  credit: number;
  payment_token: string;
}

export interface BaseInterface {
  organizationId: number;
}

export interface CrmColumn extends BaseInterface {
  id: number;
  titlePt: string;
  titleEn: string;
  color: string;
  isSystem: boolean;
}

export interface ServiceProvider {
  id: number;
  name: string;
  description_pt: string;
  description_en: string;
}

export interface Plan {
  id: number;
  name: string;
  description: string;
  priceMonth: number;
  priceYear: number;
  features: string[];
  active: boolean;
}

export interface LanguageContextType {
  language: 'pt' | 'en';
  setLanguage: (lang: 'pt' | 'en') => void;
  toggleLanguage: () => void;
}

export type Column = {
  id: string;
  title: string;
  color: string;
};

export type ValueRange = {
  min: string;
  max: string;
};

export type DateRange = {
  start: string;
  end: string;
};

export type CrmFilter = {
  status: string[];
  priority: string[];
  source: string[];
  tags: string[];
  valueRange: ValueRange;
  dateRange: DateRange;
  company: string;
  hasNotes: boolean;
  hasPhone: boolean;
  hasEmail: boolean;
};