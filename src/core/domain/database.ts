export type EntityType =
  | "save"
  | "person"
  | "band"
  | "solo_artist"
  | "label"
  | "agency"
  | "agent"
  | "festival"
  | "festival_company"
  | "venue"
  | "sponsor"
  | "staff"
  | "scout"
  | "media_outlet"
  | "council"
  | "supplier";

export interface DatabaseStatus {
  path: string;
  schemaVersion: number;
  tableCount: number;
  ready: boolean;
}

export interface EntityReference {
  entityType: EntityType;
  entityId: string;
}
