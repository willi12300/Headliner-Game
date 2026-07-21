export interface SaveRecord {
  id: string;
  name: string;
  seed: number;
  rngState: number;
  currentWeek: number;
  currentYear: number;
  schemaVersion: number;
  simulationVersion: string;
  createdAt: string;
  updatedAt: string;
}
