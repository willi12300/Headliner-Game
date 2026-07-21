export type CareerStatus =
  | "forming"
  | "active"
  | "hiatus"
  | "split"
  | "retired"
  | "reunited";

export interface BandRecord {
  id: string;
  saveId: string;
  name: string;
  genreId: string | null;
  labelId: string | null;
  agentId: string | null;
  careerStatus: CareerStatus;
  currentAbility: number;
  potentialAbility: number;
  liveAbility: number;
  studioAbility: number;
  songwritingAbility: number;
  commercialAbility: number;
  popularity: number;
  reputation: number;
  momentum: number;
  followers: number;
  monthlyListeners: number;
  ticketDraw: number;
  askingFeeMinor: number;
}

export interface PersonRecord {
  id: string;
  saveId: string;
  firstName: string;
  lastName: string;
  stageName: string | null;
  pronouns: string;
  dateOfBirth: string;
  nationalityId: string | null;
  homeRegionId: string | null;
  publicReputation: number;
  industryReputation: number;
  careerStatus: "active" | "inactive" | "retired" | "deceased";
}

export interface PersonAttributes {
  personId: string;
  professionalism: number;
  ambition: number;
  loyalty: number;
  ego: number;
  resilience: number;
  consistency: number;
  adaptability: number;
  leadership: number;
  discipline: number;
  workEthic: number;
  pressureHandling: number;
  honesty: number;
  patience: number;
  riskTolerance: number;
  commercialAppetite: number;
  artisticIntegrity: number;
  socialConfidence: number;
  controversyTendency: number;
  stressSensitivity: number;
  lifestyleDiscipline: number;
}

export interface ReleaseRecord {
  id: string;
  saveId: string;
  artistEntityType: "band" | "solo_artist";
  artistEntityId: string;
  releaseType: "single" | "ep" | "album" | "live" | "remix" | "collaboration";
  title: string;
  releaseWeek: number;
  productionQuality: number;
  songwritingQuality: number;
  criticalQuality: number;
  commercialPerformance: number;
  streamCount: number;
  viralScore: number;
  status: "planned" | "announced" | "released" | "delayed" | "cancelled";
}
