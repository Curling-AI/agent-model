import { BaseInterface, CrmColumn } from '.';
import { BaseAgent } from "./agent";

export interface FollowUp extends BaseInterface, BaseAgent {
  id: number;
  name: string;
  crmColumn: CrmColumn;
  trigger: FollowUpTrigger;
  description: string;
  messages: FollowUpMessage[];
}

export interface FollowUpMessage {
  id: number;
  followUpId: number;
  message: string;
  delayType: 'immediate' | 'custom';
  days: number;
  hours: number;
  minutes: number;
  documents: FollowUpMessageDocument[];
}

export interface FollowUpMessageDocument {
  id: number;
  followUpMessageId: number;
  type: string;
  name: string;
  url: string;
  file: File;
}

export interface FollowUpTrigger extends BaseInterface {
  id: number;
  name: string;
}