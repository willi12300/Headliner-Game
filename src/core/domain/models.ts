import type { BandDerivedValues } from "../simulation/derived/types";
import type { ArrestCase, PlayerFestival } from "./playerFestival";

export type EntityStatus = "active" | "hiatus" | "split" | "closed" | "left";

export interface BandMember {
  id: string;
  bandId: string;
  name: string;
  age: number;
  role: string;
  status: EntityStatus;
  currentAbility: number;
  potentialAbility: number;
  vocals: number;
  instrumentSkill: number;
  songwriting: number;
  creativity: number;
  stagePresence: number;
  professionalism: number;
  ambition: number;
  loyalty: number;
  ego: number;
  resilience: number;
  leadership: number;
  health: number;
  fatigue: number;
  morale: number;
  injurySusceptibility: number;
  weeksUnavailable: number;
  riskTaking: number;
  stress: number;
  pastIncidents: number;
  relationships: Record<string, number>;
  traits: string[];
}

export interface Band {
  id: string;
  name: string;
  genre: string;
  homeCity: string;
  labelId: string;
  agentId: string;
  memberIds: string[];
  status: EntityStatus;
  /** Legacy aliases retained for simulation/save compatibility. */
  currentAbility: number;
  potentialAbility: number;
  overallQuality: number;
  growthCeiling: number;
  livePerformance: number;
  catalogueQuality: number;
  reputation: number;
  commercialAppeal: number;
  fanLoyalty: number;
  festivalDraw: number;
  bookingFee: number;
  derived: BandDerivedValues;
  popularity: number;
  momentum: number;
  chemistry: number;
  morale: number;
  fatigue: number;
  financialHealth: number;
  followers: number;
  ticketDraw: number;
  professionalism: number;
  ambition: number;
  loyalty: number;
  ego: number;
  resilience: number;
  socialInfluence: number;
  viralPotential: number;
  liveAbility: number;
  festivalSuitability: number;
  traits: string[];
  isWonderband: boolean;
  activeArcIds: string[];
}

export interface Agent {
  id: string;
  name: string;
  reputation: number;
  negotiation: number;
  contacts: number;
  patience: number;
  greed: number;
  loyalty: number;
  aggression: number;
  honesty: number;
  professionalism: number;
  clientIds: string[];
}

export interface Label {
  id: string;
  name: string;
  reputation: number;
  cashReserves: number;
  debt: number;
  riskTolerance: number;
  discoveryFocus: number;
  commercialFocus: number;
  developmentQuality: number;
  rosterIds: string[];
  status: EntityStatus;
}

export interface Festival {
  id: string;
  name: string;
  genreFocus: string;
  type: string;
  status: EntityStatus;
  capacity: number;
  attendance: number;
  cashReserves: number;
  debt: number;
  reputation: number;
  discoveryReputation: number;
  authenticity: number;
  commercialism: number;
  safetyReputation: number;
  productionQuality: number;
  riskTolerance: number;
  aggression: number;
  expansionAmbition: number;
  followers: number;
  bookedBandIds: string[];
}

export interface Sponsor {
  id: string;
  name: string;
  annualBudget: number;
  fanApproval: number;
  brandReputation: number;
  audienceMatch: number;
  status: "available" | "partnered" | "withdrawn";
}

export interface Venue {
  id: string;
  name: string;
  type: string;
  capacity: number;
  rentalCost: number;
  transportQuality: number;
  drainage: number;
  councilDifficulty: number;
  floodRisk: number;
  brandPotential: number;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  reputation: number;
  judgement: number;
  potentialAssessment: number;
  negotiation: number;
  operations: number;
  loyalty: number;
  ambition: number;
  status: EntityStatus;
}

export interface StoryArc {
  id: string;
  type: "band_conflict" | "viral_breakout" | "festival_crisis";
  participantIds: string[];
  stage: number;
  severity: number;
  nextEvaluationWeek: number;
  active: boolean;
}

export interface SimulationEvent {
  id: string;
  week: number;
  year: number;
  type: string;
  severity: number;
  entityIds: string[];
  summary: string;
}

export interface Snapshot {
  year: number;
  activeBands: number;
  splitBands: number;
  activeFestivals: number;
  closedFestivals: number;
  totalFollowers: number;
  averageBandPopularity: number;
  averageFestivalReputation: number;
  viralMoments: number;
  memberDepartures: number;
  injuries: number;
  topBands: Array<{ name: string; popularity: number; followers: number }>;
  topFestivals: Array<{ name: string; reputation: number; capacity: number }>;
}

export interface WorldState {
  seed: number;
  rngState: number;
  week: number;
  year: number;
  bands: Band[];
  members: BandMember[];
  agents: Agent[];
  labels: Label[];
  festivals: Festival[];
  sponsors: Sponsor[];
  venues: Venue[];
  staff: StaffMember[];
  storyArcs: StoryArc[];
  events: SimulationEvent[];
  snapshots: Snapshot[];
  arrestCases: ArrestCase[];
  playerFestival: PlayerFestival | null;
}
