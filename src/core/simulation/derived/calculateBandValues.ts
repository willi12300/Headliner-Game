import type { Band, BandMember } from "../../domain/models";
import { average, clamp } from "../../rng/SeededRng";
import type { BandDerivedValues, DerivedComponent, DerivedValue } from "./types";

const one = (value: number) => Math.round(value * 10) / 10;
const norm20 = (value: number) => value * 5;

function derive(formula: string, parts: Array<{ label: string; value: number; weight: number; note?: string }>, min = 0, max = 100): DerivedValue {
  const components: DerivedComponent[] = parts.map((part) => ({
    label: part.label,
    sourceValue: one(part.value),
    weight: part.weight,
    contribution: one(part.value * part.weight),
    note: part.note,
  }));
  return { value: one(clamp(components.reduce((sum, part) => sum + part.contribution, 0), min, max)), components, formula };
}

function relationshipAverage(members: BandMember[]): number {
  const ids = new Set(members.map((member) => member.id));
  const values = members.flatMap((member) => Object.entries(member.relationships).filter(([id]) => ids.has(id)).map(([, value]) => value));
  return values.length ? average(values) : 50;
}

function roleSkill(member: BandMember): number {
  const role = member.role.toLowerCase();
  if (role.includes("vocal") || role.includes("rapper")) return member.vocals * 5;
  if (role.includes("producer") || role.includes("dj")) return average([member.instrumentSkill, member.creativity]) * 5;
  return member.instrumentSkill * 5;
}

export interface BandCalculationContext {
  careerExposure?: number;
  recentSuccess?: number;
  regionalReach?: number;
  releaseHistoryQuality?: number;
  existingFollowers?: number;
  momentumInput?: number;
}

export function calculateBandValues(band: Pick<Band, "socialInfluence" | "viralPotential" | "festivalSuitability" | "traits">, members: BandMember[], context: BandCalculationContext = {}): BandDerivedValues {
  const active = members.filter((member) => member.status === "active");
  const source = active.length ? active : members;
  const avg = (fn: (member: BandMember) => number) => average(source.map(fn));
  const roleCoverage = avg(roleSkill);
  const songwriting = avg((member) => member.songwriting * 5);
  const creativity = avg((member) => member.creativity * 5);
  const stagePresence = avg((member) => member.stagePresence * 5);
  const memberAbility = avg((member) => member.currentAbility);
  const memberPotential = avg((member) => member.potentialAbility);
  const healthAvailability = avg((member) => clamp(member.health - member.fatigue * 0.35 - member.weeksUnavailable * 3, 0, 100));
  const chemistry = derive("member relationships 70% + morale 20% + loyalty 10%", [
    { label: "Member relationships", value: relationshipAverage(source), weight: 0.70 },
    { label: "Member morale", value: avg((member) => member.morale), weight: 0.20 },
    { label: "Member loyalty", value: norm20(avg((member) => member.loyalty)), weight: 0.10 },
  ]);
  const professionalism = derive("professionalism 70% + resilience 20% + health availability 10%", [
    { label: "Member professionalism", value: norm20(avg((member) => member.professionalism)), weight: 0.70 },
    { label: "Member resilience", value: norm20(avg((member) => member.resilience)), weight: 0.20 },
    { label: "Health and availability", value: healthAvailability, weight: 0.10 },
  ]);
  const catalogueQuality = derive("songwriting 55% + creativity 30% + member ability 15%", [
    { label: "Songwriting", value: songwriting, weight: 0.55 },
    { label: "Creativity", value: creativity, weight: 0.30 },
    { label: "Musicianship", value: memberAbility, weight: 0.15 },
  ]);
  const livePerformance = derive("role skill 35% + stage presence 30% + chemistry 20% + availability 15%", [
    { label: "Role-specific skill", value: roleCoverage, weight: 0.35 },
    { label: "Stage presence", value: stagePresence, weight: 0.30 },
    { label: "Chemistry", value: chemistry.value, weight: 0.20 },
    { label: "Health and availability", value: healthAvailability, weight: 0.15 },
  ]);
  const overallQuality = derive("catalogue 30% + role skill 25% + live performance 20% + chemistry 15% + creative direction 10%", [
    { label: "Catalogue quality", value: catalogueQuality.value, weight: 0.30 },
    { label: "Role-specific skill", value: roleCoverage, weight: 0.25 },
    { label: "Live performance", value: livePerformance.value, weight: 0.20 },
    { label: "Chemistry", value: chemistry.value, weight: 0.15 },
    { label: "Creative direction", value: creativity, weight: 0.10 },
  ]);
  const rawCeiling = derive("member potential 55% + songwriting ceiling 20% + ambition 15% + creativity 10%", [
    { label: "Member potential", value: memberPotential, weight: 0.55 },
    { label: "Songwriting", value: songwriting, weight: 0.20 },
    { label: "Ambition", value: norm20(avg((member) => member.ambition)), weight: 0.15 },
    { label: "Creativity", value: creativity, weight: 0.10 },
  ]);
  const growthCeiling = { ...rawCeiling, value: one(Math.max(overallQuality.value, rawCeiling.value)) };
  const commercialAppeal = derive("social influence 30% + viral potential 25% + accessible catalogue 25% + stage presence 20%", [
    { label: "Social influence", value: norm20(band.socialInfluence), weight: 0.30 },
    { label: "Viral potential", value: norm20(band.viralPotential), weight: 0.25 },
    { label: "Catalogue accessibility", value: catalogueQuality.value, weight: 0.25 },
    { label: "Stage presence", value: stagePresence, weight: 0.20 },
  ]);
  const careerExposure = context.careerExposure ?? clamp(overallQuality.value * 0.45 + commercialAppeal.value * 0.25, 0, 100);
  const recentSuccess = context.recentSuccess ?? clamp(overallQuality.value * 0.42 + livePerformance.value * 0.28, 0, 100);
  const regionalReach = context.regionalReach ?? clamp(careerExposure * 0.75 + band.socialInfluence * 1.25, 0, 100);
  const momentum = derive("recent success 45% + live performance 20% + commercial appeal 20% + professionalism 15%", [
    { label: "Recent success", value: context.momentumInput ?? recentSuccess, weight: 0.45 },
    { label: "Live performance", value: livePerformance.value, weight: 0.20 },
    { label: "Commercial appeal", value: commercialAppeal.value, weight: 0.20 },
    { label: "Professionalism", value: professionalism.value, weight: 0.15 },
  ]);
  const reputation = derive("overall quality 40% + catalogue 25% + live performance 20% + professionalism 15%", [
    { label: "Overall quality", value: overallQuality.value, weight: 0.40 },
    { label: "Catalogue quality", value: context.releaseHistoryQuality ?? catalogueQuality.value, weight: 0.25 },
    { label: "Live performance", value: livePerformance.value, weight: 0.20 },
    { label: "Professionalism", value: professionalism.value, weight: 0.15 },
  ]);
  const popularity = derive("career exposure 35% + recent success 25% + commercial appeal 20% + momentum 10% + regional reach 10%", [
    { label: "Career exposure", value: careerExposure, weight: 0.35 },
    { label: "Recent success", value: recentSuccess, weight: 0.25 },
    { label: "Commercial appeal", value: commercialAppeal.value, weight: 0.20 },
    { label: "Momentum", value: momentum.value, weight: 0.10 },
    { label: "Regional reach", value: regionalReach, weight: 0.10 },
  ]);
  const fanLoyalty = derive("reputation 30% + catalogue 25% + chemistry 15% + authenticity proxy 15% + longevity proxy 15%", [
    { label: "Reputation", value: reputation.value, weight: 0.30 },
    { label: "Catalogue quality", value: catalogueQuality.value, weight: 0.25 },
    { label: "Chemistry", value: chemistry.value, weight: 0.15 },
    { label: "Creative identity", value: creativity, weight: 0.15 },
    { label: "Member loyalty", value: norm20(avg((member) => member.loyalty)), weight: 0.15 },
  ]);
  const festivalDraw = derive("popularity 35% + live performance 25% + fan loyalty 20% + momentum 10% + festival suitability 10%", [
    { label: "Popularity", value: popularity.value, weight: 0.35 },
    { label: "Live performance", value: livePerformance.value, weight: 0.25 },
    { label: "Fan loyalty", value: fanLoyalty.value, weight: 0.20 },
    { label: "Momentum", value: momentum.value, weight: 0.10 },
    { label: "Festival suitability", value: norm20(band.festivalSuitability), weight: 0.10 },
  ]);
  const followerBase = Math.pow(popularity.value / 100, 2.35) * 3_500_000;
  const followerMultiplier = 0.65 + commercialAppeal.value / 170 + regionalReach / 300;
  const followersValue = Math.max(context.existingFollowers ?? 0, Math.round(followerBase * followerMultiplier));
  const followers: DerivedValue = { value: followersValue, formula: "popularity curve × commercial conversion × regional reach", components: [
    { label: "Popularity base", sourceValue: popularity.value, weight: 1, contribution: Math.round(followerBase) },
    { label: "Commercial conversion", sourceValue: commercialAppeal.value, weight: 1, contribution: one(followerMultiplier) },
    { label: "Regional reach", sourceValue: regionalReach, weight: 1, contribution: one(regionalReach) },
  ] };
  const bookingFeeValue = Math.round((Math.pow(festivalDraw.value / 100, 2.2) * 180_000 + reputation.value * 900 + momentum.value * 350) / 500) * 500;
  const bookingFee: DerivedValue = { value: bookingFeeValue, formula: "festival draw curve + reputation premium + momentum premium", components: [
    { label: "Festival draw", sourceValue: festivalDraw.value, weight: 1, contribution: Math.round(Math.pow(festivalDraw.value / 100, 2.2) * 180_000) },
    { label: "Reputation premium", sourceValue: reputation.value, weight: 900, contribution: Math.round(reputation.value * 900) },
    { label: "Momentum premium", sourceValue: momentum.value, weight: 350, contribution: Math.round(momentum.value * 350) },
  ] };

  return { overallQuality, growthCeiling, livePerformance, catalogueQuality, chemistry, professionalism, reputation, commercialAppeal, fanLoyalty, festivalDraw, popularity, momentum, followers, bookingFee };
}

export function applyBandDerivedValues(band: Band, values: BandDerivedValues): void {
  band.derived = values;
  band.overallQuality = values.overallQuality.value;
  band.growthCeiling = values.growthCeiling.value;
  band.livePerformance = values.livePerformance.value;
  band.catalogueQuality = values.catalogueQuality.value;
  band.reputation = values.reputation.value;
  band.commercialAppeal = values.commercialAppeal.value;
  band.fanLoyalty = values.fanLoyalty.value;
  band.festivalDraw = values.festivalDraw.value;
  band.bookingFee = values.bookingFee.value;
  band.currentAbility = band.overallQuality;
  band.potentialAbility = band.growthCeiling;
  band.liveAbility = band.livePerformance;
  band.chemistry = values.chemistry.value;
  band.professionalism = values.professionalism.value / 5;
  band.popularity = values.popularity.value;
  band.momentum = values.momentum.value;
  band.followers = Math.round(values.followers.value);
  band.ticketDraw = Math.round(Math.pow(values.festivalDraw.value / 100, 2.1) * 42_000);
}
