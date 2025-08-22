import { CrmColumn } from ".";

export interface FollowUp {
  id: number;
  name: string;
  crmColumn: CrmColumn;
  trigger: FollowUpTrigger;
  description: string;
}

export interface MessageSequence {
  id: number;
  message: string;
  days: number;
  hours: number;
  minutes: number;
  documents: MessageSequenceDocument[];
}

export interface MessageSequenceDocument {
  id: number;
  url: string;
}

export interface FollowUpTrigger {
  id: number;
  name: string;
}