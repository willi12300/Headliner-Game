export interface DerivedComponent {
  label: string;
  sourceValue: number;
  weight: number;
  contribution: number;
  note?: string;
}

export interface DerivedValue {
  value: number;
  components: DerivedComponent[];
  formula: string;
}

export interface BandDerivedValues {
  overallQuality: DerivedValue;
  growthCeiling: DerivedValue;
  livePerformance: DerivedValue;
  catalogueQuality: DerivedValue;
  chemistry: DerivedValue;
  professionalism: DerivedValue;
  reputation: DerivedValue;
  commercialAppeal: DerivedValue;
  fanLoyalty: DerivedValue;
  festivalDraw: DerivedValue;
  popularity: DerivedValue;
  momentum: DerivedValue;
  followers: DerivedValue;
  bookingFee: DerivedValue;
}
