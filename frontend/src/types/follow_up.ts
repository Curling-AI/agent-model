import { BaseInterface, CrmColumn } from '.';
import { BaseAgent } from "./agent";

export interface FollowUp extends BaseInterface, BaseAgent {
  id: number;
  name: string;
  crmColumn: CrmColumn;
  trigger: FollowUpTrigger;
  description: string;
  messageSequences: MessageSequence[];
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

export interface FollowUpTrigger extends BaseInterface {
  id: number;
  name: string;
}