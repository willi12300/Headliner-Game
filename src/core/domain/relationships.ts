import type { EntityType } from "./database";

export interface RelationshipRecord {
  id: string;
  saveId: string;
  sourceEntityType: EntityType;
  sourceEntityId: string;
  targetEntityType: EntityType;
  targetEntityId: string;
  trust: number;
  respect: number;
  familiarity: number;
  commercialValue: number;
  overallScore: number;
  lastInteractionWeek: number;
}

export interface RelationshipMemoryRecord {
  id: string;
  relationshipId: string;
  memoryType: string;
  value: number;
  description: string;
  createdWeek: number;
  decayPerWeek: number;
  isPermanent: boolean;
}
