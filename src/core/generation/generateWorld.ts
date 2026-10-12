import type {
  Agent,
  Band,
  BandMember,
  Festival,
  Label,
  Sponsor,
  StaffMember,
  Venue,
  WorldState,
} from "../domain/models";
import { average, clamp, SeededRng } from "../rng/SeededRng";
import { conductDefaults } from "../simulation/arrests";
import { applyBandDerivedValues, calculateBandValues } from "../simulation/derived";

const firstNames = ["Alex", "Sam", "Mia", "Tom", "Freya", "Jack", "Lola", "Ryan", "Emma", "Ash", "Maya", "Ollie", "Nina", "Jude", "Finn", "Ruby", "Charlie", "Sienna", "Oscar", "Ivy"];
const surnames = ["Stone", "Rivers", "Cooper", "Green", "Patel", "Moon", "Brooks", "Lane", "Carter", "Wilson", "Knight", "Fox", "Jordan", "Mason", "Reed", "Banks", "Hale", "Woods"];
const bandFirst = ["Moonflower", "Velvet", "Neon", "Basement", "Glass", "Wild", "Golden", "Electric", "Silver", "Feral", "Cosmic", "Muddy", "Sunday", "River", "Static", "Northern", "Paper", "Crystal", "Lunar", "Jungle"];
const bandSecond = ["Riot", "Youth", "Caravan", "Goblin", "Tides", "Club", "Saints", "Rabbits", "Theory", "Drifters", "Kites", "Garden", "Wolves", "Choir", "Anthem", "Fever", "Roses", "Echoes", "Pilots", "Hearts"];
const genres = ["Indie", "Rock", "Electronic", "Folk", "Hip Hop", "Psychedelic", "Punk", "Pop", "Drum & Bass", "Soul", "Experimental"];
const cities = ["Manchester", "Liverpool", "Bristol", "Leeds", "Glasgow", "Brighton", "Cardiff", "London", "Sheffield", "Belfast"];
const memberRoles = ["Lead Vocalist", "Guitarist", "Bassist", "Drummer", "Keyboardist", "Producer", "DJ", "Rapper", "Multi-Instrumentalist"];
const bandPositiveTraits = ["Always Delivers Live", "Cult Following", "Fast-Growing Fanbase", "Festival Crowd Favourite", "Excellent Improvisers"];
const bandNegativeTraits = ["Creative Differences", "Frequently Late", "High Rider Demands", "Tour Fatigue Prone", "Fragile Morale"];
const labelNames = ["Solar Records", "Blackbird Music", "Wildflower Sounds", "Muddy Boots Records"];
const festivalNames = ["Lost Valley", "Woodland Sounds", "Solar Fields", "Rivercamp"];
const sponsorNames = ["Wander Brew Co.", "NorthCore Clothing", "SoundSphere Audio", "Echo Energy", "Horizon Mobile"];
const venueNames = ["Willow Fields", "Echo Woods", "Silver Farm", "River Park", "Castle Grounds", "Sunset Beach", "Pine Forest", "Lowland Estate"];
const venueTypes = ["Field", "Forest", "Farm", "City Park", "Castle Grounds", "Beach"];
const festivalTypes = ["Grassroots", "Boutique", "Commercial", "Discovery", "Electronic Weekender"];
const staffRoles = ["Booking Manager", "Scout", "Marketing Director", "Operations Manager", "Security Chief", "Sponsorship Manager"];

const id = (prefix: string, rng: SeededRng): string => `${prefix}_${rng.int(100000, 999999)}_${rng.int(100000, 999999)}`;
const personName = (rng: SeededRng): string => `${rng.pick(firstNames)} ${rng.pick(surnames)}`;

export function generateWorld(seed: number): WorldState {
  const rng = new SeededRng(seed);

  const labels: Label[] = labelNames.map((name) => ({
    id: id("label", rng),
    name,
    reputation: rng.int(25, 82),
    cashReserves: rng.int(250000, 1500000),
    debt: rng.int(0, 180000),
    riskTolerance: rng.int(1, 20),
    discoveryFocus: rng.int(1, 20),
    commercialFocus: rng.int(1, 20),
    developmentQuality: rng.int(1, 20),
    rosterIds: [],
    status: "active",
  }));

  const agents: Agent[] = Array.from({ length: 10 }, () => ({
    id: id("agent", rng),
    name: personName(rng),
    reputation: rng.int(15, 82),
    negotiation: rng.int(1, 20),
    contacts: rng.int(1, 20),
    patience: rng.int(1, 20),
    greed: rng.int(1, 20),
    loyalty: rng.int(1, 20),
    aggression: rng.int(1, 20),
    honesty: rng.int(1, 20),
    professionalism: rng.int(1, 20),
    clientIds: [],
  }));

  const members: BandMember[] = [];
  const bands: Band[] = [];
  const usedNames = new Set<string>();

  for (let index = 0; index < 20; index += 1) {
    let name = `${rng.pick(bandFirst)} ${rng.pick(bandSecond)}`;
    while (usedNames.has(name)) name = `${rng.pick(bandFirst)} ${rng.pick(bandSecond)}`;
    usedNames.add(name);

    const bandId = id("band", rng);
    const isWonderband = rng.chance(0.14);
    const memberCount = rng.int(3, 5);
    const roles = rng.shuffle(memberRoles).slice(0, memberCount);
    if (!roles.includes("Lead Vocalist")) roles[0] = "Lead Vocalist";

    const bandMembers = roles.map((role) => {
      const potentialAbility = clamp(rng.int(45, 88) + (isWonderband ? rng.int(6, 16) : 0), 1, 99);
      const currentAbility = rng.int(20, Math.max(21, Math.min(75, Math.floor(potentialAbility))));
      const member: BandMember = {
        id: id("member", rng),
        bandId,
        name: personName(rng),
        age: rng.int(18, 38),
        role,
        status: "active",
        currentAbility,
        potentialAbility,
        vocals: clamp(rng.int(1, 20) + (role === "Lead Vocalist" ? 4 : 0), 1, 20),
        instrumentSkill: rng.int(4, 20),
        songwriting: rng.int(2, 20),
        creativity: rng.int(2, 20),
        stagePresence: rng.int(2, 20),
        professionalism: rng.int(1, 20),
        ambition: rng.int(1, 20),
        loyalty: rng.int(1, 20),
        ego: rng.int(1, 20),
        resilience: rng.int(1, 20),
        leadership: rng.int(1, 20),
        health: rng.int(82, 100),
        fatigue: rng.int(0, 16),
        morale: rng.int(55, 86),
        injurySusceptibility: rng.int(1, 20),
        weeksUnavailable: 0,
        riskTaking: 0, stress: 0, pastIncidents: 0,
        relationships: {},
        traits: rng.chance(0.12) ? [rng.pick(["Natural Leader", "Creative Genius", "Poor Lifestyle", "Injury Prone"])] : [],
      };
      Object.assign(member, conductDefaults(member.id, member.professionalism));
      return member;
    });

    bandMembers.forEach((member) => {
      bandMembers.forEach((other) => {
        if (member.id !== other.id) member.relationships[other.id] = rng.int(35, 86);
      });
    });

    const label = rng.pick(labels);
    const agent = rng.pick(agents);
    const traits = [rng.pick(bandPositiveTraits)];
    if (isWonderband && !traits.includes("Fast-Growing Fanbase")) traits.push("Fast-Growing Fanbase");
    if (rng.chance(0.38)) traits.push(rng.pick(bandNegativeTraits));

    // Career context is generated first; visible market values are then derived from it.
    // This allows a cult veteran, new breakout or unknown wonderband to have coherent but distinct profiles.
    const careerStage = rng.pick(["new", "developing", "established", "cult", "breakout"] as const);
    const stageContext = {
      new: { exposure: rng.int(4, 18), success: rng.int(8, 28), reach: rng.int(3, 16) },
      developing: { exposure: rng.int(18, 42), success: rng.int(22, 50), reach: rng.int(14, 38) },
      established: { exposure: rng.int(48, 78), success: rng.int(42, 72), reach: rng.int(45, 78) },
      cult: { exposure: rng.int(30, 56), success: rng.int(38, 68), reach: rng.int(24, 50) },
      breakout: { exposure: rng.int(42, 72), success: rng.int(68, 94), reach: rng.int(38, 70) },
    }[careerStage];

    const band = {
      id: bandId,
      name,
      genre: rng.pick(genres),
      homeCity: rng.pick(cities),
      labelId: label.id,
      agentId: agent.id,
      memberIds: bandMembers.map((member) => member.id),
      status: "active",
      currentAbility: 0,
      potentialAbility: 0,
      overallQuality: 0,
      growthCeiling: 0,
      livePerformance: 0,
      catalogueQuality: 0,
      reputation: 0,
      commercialAppeal: 0,
      fanLoyalty: 0,
      festivalDraw: 0,
      bookingFee: 0,
      derived: {} as Band["derived"],
      popularity: 0,
      momentum: 0,
      chemistry: 0,
      morale: average(bandMembers.map((member) => member.morale)),
      fatigue: average(bandMembers.map((member) => member.fatigue)),
      financialHealth: rng.int(25, 82),
      followers: 0,
      ticketDraw: 0,
      professionalism: 0,
      ambition: average(bandMembers.map((member) => member.ambition)),
      loyalty: average(bandMembers.map((member) => member.loyalty)),
      ego: average(bandMembers.map((member) => member.ego)),
      resilience: average(bandMembers.map((member) => member.resilience)),
      socialInfluence: rng.int(1, 20),
      viralPotential: rng.int(1, 20),
      liveAbility: 0,
      festivalSuitability: rng.int(4, 20),
      traits: [...traits, `Career Stage: ${careerStage}`],
      isWonderband,
      activeArcIds: [],
    } as Band;

    const derived = calculateBandValues(band, bandMembers, {
      careerExposure: isWonderband ? Math.min(stageContext.exposure, 26) : stageContext.exposure,
      recentSuccess: stageContext.success,
      regionalReach: stageContext.reach,
      momentumInput: stageContext.success,
    });
    applyBandDerivedValues(band, derived);

    label.rosterIds.push(band.id);
    agent.clientIds.push(band.id);
    bands.push(band);
    members.push(...bandMembers);
  }

  const venues: Venue[] = venueNames.map((name) => ({
    id: id("venue", rng),
    name,
    type: rng.pick(venueTypes),
    capacity: Math.round(rng.int(1800, 30000) / 500) * 500,
    rentalCost: Math.round(rng.int(18000, 280000) / 1000) * 1000,
    transportQuality: rng.int(1, 20),
    drainage: rng.int(1, 20),
    councilDifficulty: rng.int(10, 90),
    floodRisk: rng.int(5, 75),
    brandPotential: rng.int(20, 95),
  }));

  const festivals: Festival[] = festivalNames.map((name) => {
    const capacity = Math.round(rng.int(2500, 26000) / 500) * 500;
    return {
      id: id("festival", rng),
      name,
      genreFocus: rng.pick(genres),
      type: rng.pick(festivalTypes),
      status: "active",
      capacity,
      attendance: Math.round(capacity * rng.float(0.45, 0.9)),
      cashReserves: rng.int(90000, 900000),
      debt: rng.int(0, 180000),
      reputation: rng.int(18, 72),
      discoveryReputation: rng.int(10, 78),
      authenticity: rng.int(20, 90),
      commercialism: rng.int(10, 85),
      safetyReputation: rng.int(35, 88),
      productionQuality: rng.int(4, 18),
      riskTolerance: rng.int(1, 20),
      aggression: rng.int(1, 20),
      expansionAmbition: rng.int(1, 20),
      followers: rng.int(3500, 250000),
      bookedBandIds: [],
    };
  });

  const sponsors: Sponsor[] = sponsorNames.map((name) => ({
    id: id("sponsor", rng),
    name,
    annualBudget: rng.int(30000, 320000),
    fanApproval: rng.int(20, 90),
    brandReputation: rng.int(25, 92),
    audienceMatch: rng.int(20, 92),
    status: "available",
  }));

  const staff: StaffMember[] = Array.from({ length: 20 }, () => ({
    id: id("staff", rng),
    name: personName(rng),
    role: rng.pick(staffRoles),
    reputation: rng.int(10, 82),
    judgement: rng.int(1, 20),
    potentialAssessment: rng.int(1, 20),
    negotiation: rng.int(1, 20),
    operations: rng.int(1, 20),
    loyalty: rng.int(1, 20),
    ambition: rng.int(1, 20),
    status: "active",
  }));

  return {
    seed,
    rngState: rng.getState(),
    week: 0,
    year: 0,
    bands,
    members,
    agents,
    labels,
    festivals,
    sponsors,
    venues,
    staff,
    storyArcs: [],
    events: [],
    snapshots: [],
    arrestCases: [],
    playerFestival: null,
  };
}
