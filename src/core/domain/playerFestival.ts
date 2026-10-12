export interface FestivalBooking {
  id: string;
  bandId: string;
  fee: number;
  status: "booked" | "cancelled" | "performed" | "missed";
}

export interface FestivalDecision {
  caseId: string;
  bookingId: string;
  choice: "keep" | "cancel" | "replace";
  week: number;
}

export interface FestivalResult {
  attendance: number;
  revenue: number;
  costs: number;
  profit: number;
  reputationChange: number;
  performedBandIds: string[];
  missedBandIds: string[];
}

export interface PlayerFestival {
  id: string;
  name: string;
  venueId: string;
  genreFocus: string;
  eventWeek: number;
  capacity: number;
  ticketPrice: number;
  startingCash: number;
  cash: number;
  operatingCost: number;
  reputation: number;
  status: "planning" | "completed";
  scenario: "standard" | "backstage_crisis";
  scenarioTriggered: boolean;
  bookings: FestivalBooking[];
  decisions: FestivalDecision[];
  bandTrust: Record<string, number>;
  result: FestivalResult | null;
}

export interface ArrestCase {
  id: string;
  memberId: string;
  bandId: string;
  startedWeek: number;
  nextHearingWeek: number;
  stage: number;
  status: "detained" | "on_bail" | "cleared" | "fined";
  active: boolean;
}
