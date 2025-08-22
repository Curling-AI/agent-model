export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  status: string;
  lastLogin: string;
  createdAt: string;
  phone: string;
  avatar: string;
  permissions: number[];
}

// Define Department type
export interface Department {
  id: number;
  name: string;
  description: string;
  manager: string;
  userCount: number;
  createdAt: string;
};

export interface Permission {
  id: number;
  name: string;
  description: string;
  category: string;
};

export interface Message {
  id: number;
  type: 'lead' | 'bot';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: number;
  leadName: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  status: string;
  agent: string;
  channel: string;
  unread: number;
  qualified: boolean;
  priority: string;
  responseTime?: string;
  messages?: Message[];
}

export interface Personality {
  tone: string;
  style: string;
  greetingMessage: string;
  customInstructions: string;
  voiceSetting: string;
}

export interface WorkingHours {
  enabled: boolean;
  start: string;
  end: string;
  timezone: string;
}

export interface SystemPrompt {
  mode: 'template' | 'advanced';
  selectedTemplate: string;
  customPrompt: string;
}

export interface Behavior {
  responseTime: string;
  escalationRules: any[]; // Defina um tipo específico se necessário
  workingHours: WorkingHours;
  systemPrompt: SystemPrompt;
}

export interface Document {
  // Defina os campos conforme necessário
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
}

export interface YouTubeVideo {
  id: number;
  url: string;
  title: string;
  description: string;
  transcript: string;
  addedAt: string;
}

export interface KnowledgeBase {
  documents: Document[];
  faqs: Faq[];
  websiteUrl: string;
  youtubeVideos: YouTubeVideo[];
}

export interface FollowUpMessage {
  id: number;
  content: string;
  template: string;
  attachments: any[]; // Defina um tipo específico se necessário
  delay: {
    type: string;
    days: number;
    hours: number;
    minutes: number;
  };
}

export interface FollowUpSequence {
  id: number;
  name: string;
  description: string;
  trigger: string;
  delay: {
    type: string;
    days: number;
    hours: number;
    minutes: number;
  };
  messages: FollowUpMessage[];
}

export interface FollowUps {
  enabled: boolean;
  sequences: FollowUpSequence[];
}

export interface Agent {
  name: string;
  description: string;
  avatar: string;
  personality: Personality;
  behavior: Behavior;
  knowledgeBase: KnowledgeBase;
  followUps: FollowUps;
  channels: string[];
}

export interface Delay {
  type: string;
  days: number;
  hours: number;
  minutes: number;
}

export interface Attachment {
  id: number;
  type: 'document' | 'video' | 'audio';
  name: string;
  size: number;
  url: string;
}

export interface FollowUp {
  name: string;
  description: string;
  crmColumn: string;
  trigger: string;
  delay: Delay;
  messages: FollowUpMessage[];
}

export interface Lead {
  id?: number;
  name: string;
  company: string;
  avatar?: string;
  email: string;
  phone: string;
  value: number;
  status?: string;
  priority: string;
  lastContact?: string;
  source: string;
  tags: string[];
  notes: string;
}

export interface PlanPrice {
  monthly: number;
  yearly: number;
}

export interface Plan {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  price: PlanPrice;
  credits: number;
  features: string[];
  popular: boolean;
}

export interface LanguageContextType {
  language: 'pt' | 'en';
  setLanguage: (lang: 'pt' | 'en') => void;
  toggleLanguage: () => void;
}
