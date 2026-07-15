PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS saves (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  seed INTEGER NOT NULL,
  rng_state INTEGER NOT NULL,
  current_week INTEGER NOT NULL DEFAULT 0 CHECK(current_week >= 0),
  current_year INTEGER NOT NULL DEFAULT 1 CHECK(current_year >= 1),
  schema_version INTEGER NOT NULL DEFAULT 1,
  simulation_version TEXT NOT NULL DEFAULT '0.1.0',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS genres (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  parent_id TEXT REFERENCES genres(id),
  trend REAL NOT NULL DEFAULT 50 CHECK(trend BETWEEN 0 AND 100)
);

CREATE TABLE IF NOT EXISTS member_roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS staff_roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS labels (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  founded_year INTEGER NOT NULL,
  headquarters TEXT NOT NULL,
  size TEXT NOT NULL,
  genre_id TEXT REFERENCES genres(id),
  reputation REAL NOT NULL CHECK(reputation BETWEEN 0 AND 100),
  cash_reserves REAL NOT NULL,
  annual_revenue REAL NOT NULL,
  artist_investment_budget REAL NOT NULL,
  marketing_budget REAL NOT NULL,
  debt REAL NOT NULL DEFAULT 0,
  risk_tolerance INTEGER NOT NULL CHECK(risk_tolerance BETWEEN 1 AND 20),
  discovery_focus INTEGER NOT NULL CHECK(discovery_focus BETWEEN 1 AND 20),
  commercial_focus INTEGER NOT NULL CHECK(commercial_focus BETWEEN 1 AND 20),
  genre_purity INTEGER NOT NULL CHECK(genre_purity BETWEEN 1 AND 20),
  development_quality INTEGER NOT NULL CHECK(development_quality BETWEEN 1 AND 20),
  international_ambition INTEGER NOT NULL CHECK(international_ambition BETWEEN 1 AND 20),
  release_frequency INTEGER NOT NULL CHECK(release_frequency BETWEEN 1 AND 20),
  status TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  agency_name TEXT NOT NULL,
  region TEXT NOT NULL,
  reputation REAL NOT NULL CHECK(reputation BETWEEN 0 AND 100),
  negotiation INTEGER NOT NULL CHECK(negotiation BETWEEN 1 AND 20),
  industry_contacts INTEGER NOT NULL CHECK(industry_contacts BETWEEN 1 AND 20),
  artist_judgement INTEGER NOT NULL CHECK(artist_judgement BETWEEN 1 AND 20),
  commercial_judgement INTEGER NOT NULL CHECK(commercial_judgement BETWEEN 1 AND 20),
  patience INTEGER NOT NULL CHECK(patience BETWEEN 1 AND 20),
  greed INTEGER NOT NULL CHECK(greed BETWEEN 1 AND 20),
  loyalty INTEGER NOT NULL CHECK(loyalty BETWEEN 1 AND 20),
  aggression INTEGER NOT NULL CHECK(aggression BETWEEN 1 AND 20),
  honesty INTEGER NOT NULL CHECK(honesty BETWEEN 1 AND 20),
  professionalism INTEGER NOT NULL CHECK(professionalism BETWEEN 1 AND 20),
  preferred_deal_length INTEGER NOT NULL DEFAULT 1,
  fee_expectation INTEGER NOT NULL CHECK(fee_expectation BETWEEN 1 AND 20),
  exclusivity_preference INTEGER NOT NULL CHECK(exclusivity_preference BETWEEN 1 AND 20),
  prestige_focus INTEGER NOT NULL CHECK(prestige_focus BETWEEN 1 AND 20),
  client_care INTEGER NOT NULL CHECK(client_care BETWEEN 1 AND 20),
  status TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS bands (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  formation_year INTEGER NOT NULL,
  home_city TEXT NOT NULL,
  home_country TEXT NOT NULL,
  genre_id TEXT REFERENCES genres(id),
  subgenre TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  label_id TEXT REFERENCES labels(id),
  agent_id TEXT REFERENCES agents(id),
  current_ability REAL NOT NULL CHECK(current_ability BETWEEN 0 AND 100),
  potential_ability REAL NOT NULL CHECK(potential_ability BETWEEN 0 AND 100),
  live_ability REAL NOT NULL CHECK(live_ability BETWEEN 0 AND 100),
  studio_ability REAL NOT NULL CHECK(studio_ability BETWEEN 0 AND 100),
  songwriting_ability REAL NOT NULL CHECK(songwriting_ability BETWEEN 0 AND 100),
  commercial_ability REAL NOT NULL CHECK(commercial_ability BETWEEN 0 AND 100),
  popularity REAL NOT NULL CHECK(popularity BETWEEN 0 AND 100),
  reputation REAL NOT NULL CHECK(reputation BETWEEN 0 AND 100),
  momentum REAL NOT NULL CHECK(momentum BETWEEN 0 AND 100),
  followers INTEGER NOT NULL DEFAULT 0,
  monthly_listeners INTEGER NOT NULL DEFAULT 0,
  fan_loyalty REAL NOT NULL CHECK(fan_loyalty BETWEEN 0 AND 100),
  ticket_draw INTEGER NOT NULL DEFAULT 0,
  merchandise_strength REAL NOT NULL CHECK(merchandise_strength BETWEEN 0 AND 100),
  streaming_strength REAL NOT NULL CHECK(streaming_strength BETWEEN 0 AND 100),
  press_interest REAL NOT NULL CHECK(press_interest BETWEEN 0 AND 100),
  industry_interest REAL NOT NULL CHECK(industry_interest BETWEEN 0 AND 100),
  chemistry REAL NOT NULL CHECK(chemistry BETWEEN 0 AND 100),
  morale REAL NOT NULL CHECK(morale BETWEEN 0 AND 100),
  fatigue REAL NOT NULL CHECK(fatigue BETWEEN 0 AND 100),
  financial_health REAL NOT NULL CHECK(financial_health BETWEEN 0 AND 100),
  creative_satisfaction REAL NOT NULL CHECK(creative_satisfaction BETWEEN 0 AND 100),
  tour_satisfaction REAL NOT NULL CHECK(tour_satisfaction BETWEEN 0 AND 100),
  label_satisfaction REAL NOT NULL CHECK(label_satisfaction BETWEEN 0 AND 100),
  agent_satisfaction REAL NOT NULL CHECK(agent_satisfaction BETWEEN 0 AND 100),
  professionalism INTEGER NOT NULL CHECK(professionalism BETWEEN 1 AND 20),
  ambition INTEGER NOT NULL CHECK(ambition BETWEEN 1 AND 20),
  loyalty INTEGER NOT NULL CHECK(loyalty BETWEEN 1 AND 20),
  ego INTEGER NOT NULL CHECK(ego BETWEEN 1 AND 20),
  resilience INTEGER NOT NULL CHECK(resilience BETWEEN 1 AND 20),
  risk_tolerance INTEGER NOT NULL CHECK(risk_tolerance BETWEEN 1 AND 20),
  commercial_appetite INTEGER NOT NULL CHECK(commercial_appetite BETWEEN 1 AND 20),
  artistic_integrity INTEGER NOT NULL CHECK(artistic_integrity BETWEEN 1 AND 20),
  work_ethic INTEGER NOT NULL CHECK(work_ethic BETWEEN 1 AND 20),
  stage_presence INTEGER NOT NULL CHECK(stage_presence BETWEEN 1 AND 20),
  crowd_interaction INTEGER NOT NULL CHECK(crowd_interaction BETWEEN 1 AND 20),
  energy INTEGER NOT NULL CHECK(energy BETWEEN 1 AND 20),
  musical_tightness INTEGER NOT NULL CHECK(musical_tightness BETWEEN 1 AND 20),
  improvisation INTEGER NOT NULL CHECK(improvisation BETWEEN 1 AND 20),
  production_value INTEGER NOT NULL CHECK(production_value BETWEEN 1 AND 20),
  punctuality INTEGER NOT NULL CHECK(punctuality BETWEEN 1 AND 20),
  festival_suitability INTEGER NOT NULL CHECK(festival_suitability BETWEEN 1 AND 20),
  bad_weather_performance INTEGER NOT NULL CHECK(bad_weather_performance BETWEEN 1 AND 20),
  large_crowd_confidence INTEGER NOT NULL CHECK(large_crowd_confidence BETWEEN 1 AND 20),
  social_influence INTEGER NOT NULL CHECK(social_influence BETWEEN 1 AND 20),
  marketability INTEGER NOT NULL CHECK(marketability BETWEEN 1 AND 20),
  media_ability INTEGER NOT NULL CHECK(media_ability BETWEEN 1 AND 20),
  merchandise_appeal INTEGER NOT NULL CHECK(merchandise_appeal BETWEEN 1 AND 20),
  brand_friendliness INTEGER NOT NULL CHECK(brand_friendliness BETWEEN 1 AND 20),
  audience_crossover INTEGER NOT NULL CHECK(audience_crossover BETWEEN 1 AND 20),
  viral_potential INTEGER NOT NULL CHECK(viral_potential BETWEEN 1 AND 20),
  is_wonderband INTEGER NOT NULL DEFAULT 0 CHECK(is_wonderband IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS band_members (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
  band_id TEXT REFERENCES bands(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  birth_year INTEGER NOT NULL,
  nationality TEXT NOT NULL,
  home_region TEXT NOT NULL,
  role_id TEXT REFERENCES member_roles(id),
  status TEXT NOT NULL DEFAULT 'active',
  current_ability REAL NOT NULL CHECK(current_ability BETWEEN 0 AND 100),
  potential_ability REAL NOT NULL CHECK(potential_ability BETWEEN 0 AND 100),
  vocals INTEGER NOT NULL CHECK(vocals BETWEEN 1 AND 20),
  instrument_skill INTEGER NOT NULL CHECK(instrument_skill BETWEEN 1 AND 20),
  songwriting INTEGER NOT NULL CHECK(songwriting BETWEEN 1 AND 20),
  composition INTEGER NOT NULL CHECK(composition BETWEEN 1 AND 20),
  production INTEGER NOT NULL CHECK(production BETWEEN 1 AND 20),
  creativity INTEGER NOT NULL CHECK(creativity BETWEEN 1 AND 20),
  improvisation INTEGER NOT NULL CHECK(improvisation BETWEEN 1 AND 20),
  stage_presence INTEGER NOT NULL CHECK(stage_presence BETWEEN 1 AND 20),
  crowd_interaction INTEGER NOT NULL CHECK(crowd_interaction BETWEEN 1 AND 20),
  media_ability INTEGER NOT NULL CHECK(media_ability BETWEEN 1 AND 20),
  professionalism INTEGER NOT NULL CHECK(professionalism BETWEEN 1 AND 20),
  ambition INTEGER NOT NULL CHECK(ambition BETWEEN 1 AND 20),
  loyalty INTEGER NOT NULL CHECK(loyalty BETWEEN 1 AND 20),
  ego INTEGER NOT NULL CHECK(ego BETWEEN 1 AND 20),
  resilience INTEGER NOT NULL CHECK(resilience BETWEEN 1 AND 20),
  consistency INTEGER NOT NULL CHECK(consistency BETWEEN 1 AND 20),
  adaptability INTEGER NOT NULL CHECK(adaptability BETWEEN 1 AND 20),
  leadership INTEGER NOT NULL CHECK(leadership BETWEEN 1 AND 20),
  discipline INTEGER NOT NULL CHECK(discipline BETWEEN 1 AND 20),
  work_ethic INTEGER NOT NULL CHECK(work_ethic BETWEEN 1 AND 20),
  health REAL NOT NULL CHECK(health BETWEEN 0 AND 100),
  fatigue REAL NOT NULL CHECK(fatigue BETWEEN 0 AND 100),
  fitness REAL NOT NULL CHECK(fitness BETWEEN 0 AND 100),
  voice_condition REAL NOT NULL CHECK(voice_condition BETWEEN 0 AND 100),
  hearing_condition REAL NOT NULL CHECK(hearing_condition BETWEEN 0 AND 100),
  injury_susceptibility INTEGER NOT NULL CHECK(injury_susceptibility BETWEEN 1 AND 20),
  tour_endurance INTEGER NOT NULL CHECK(tour_endurance BETWEEN 1 AND 20),
  morale REAL NOT NULL CHECK(morale BETWEEN 0 AND 100),
  band_satisfaction REAL NOT NULL CHECK(band_satisfaction BETWEEN 0 AND 100),
  label_satisfaction REAL NOT NULL CHECK(label_satisfaction BETWEEN 0 AND 100),
  agent_satisfaction REAL NOT NULL CHECK(agent_satisfaction BETWEEN 0 AND 100),
  weeks_unavailable INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS festival_companies (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cash_reserves REAL NOT NULL,
  debt REAL NOT NULL DEFAULT 0,
  reputation REAL NOT NULL CHECK(reputation BETWEEN 0 AND 100),
  risk_appetite INTEGER NOT NULL CHECK(risk_appetite BETWEEN 1 AND 20),
  expansion_ambition INTEGER NOT NULL CHECK(expansion_ambition BETWEEN 1 AND 20),
  strategy TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS venues (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  venue_type TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  ownership_status TEXT NOT NULL,
  maximum_capacity INTEGER NOT NULL,
  licensed_capacity INTEGER NOT NULL,
  camping_capacity INTEGER NOT NULL,
  parking_capacity INTEGER NOT NULL,
  stage_capacity INTEGER NOT NULL,
  water INTEGER NOT NULL CHECK(water BETWEEN 1 AND 20),
  power INTEGER NOT NULL CHECK(power BETWEEN 1 AND 20),
  drainage INTEGER NOT NULL CHECK(drainage BETWEEN 1 AND 20),
  mobile_signal INTEGER NOT NULL CHECK(mobile_signal BETWEEN 1 AND 20),
  emergency_access INTEGER NOT NULL CHECK(emergency_access BETWEEN 1 AND 20),
  transport_quality INTEGER NOT NULL CHECK(transport_quality BETWEEN 1 AND 20),
  camping_quality INTEGER NOT NULL CHECK(camping_quality BETWEEN 1 AND 20),
  noise_restriction INTEGER NOT NULL CHECK(noise_restriction BETWEEN 0 AND 100),
  curfew_hour INTEGER NOT NULL CHECK(curfew_hour BETWEEN 0 AND 24),
  council_difficulty INTEGER NOT NULL CHECK(council_difficulty BETWEEN 0 AND 100),
  environmental_sensitivity INTEGER NOT NULL CHECK(environmental_sensitivity BETWEEN 0 AND 100),
  flood_risk INTEGER NOT NULL CHECK(flood_risk BETWEEN 0 AND 100),
  wind_exposure INTEGER NOT NULL CHECK(wind_exposure BETWEEN 0 AND 100),
  heat_exposure INTEGER NOT NULL CHECK(heat_exposure BETWEEN 0 AND 100),
  ground_durability INTEGER NOT NULL CHECK(ground_durability BETWEEN 0 AND 100),
  neighbour_tolerance INTEGER NOT NULL CHECK(neighbour_tolerance BETWEEN 0 AND 100),
  rental_cost REAL NOT NULL,
  purchase_cost REAL NOT NULL,
  deposit REAL NOT NULL,
  insurance_requirement REAL NOT NULL,
  expansion_potential INTEGER NOT NULL CHECK(expansion_potential BETWEEN 0 AND 100),
  natural_beauty INTEGER NOT NULL CHECK(natural_beauty BETWEEN 0 AND 100),
  uniqueness INTEGER NOT NULL CHECK(uniqueness BETWEEN 0 AND 100),
  brand_potential INTEGER NOT NULL CHECK(brand_potential BETWEEN 0 AND 100),
  accessibility INTEGER NOT NULL CHECK(accessibility BETWEEN 0 AND 100)
);

CREATE TABLE IF NOT EXISTS festivals (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
  company_id TEXT REFERENCES festival_companies(id),
  name TEXT NOT NULL,
  founded_year INTEGER NOT NULL,
  region TEXT NOT NULL,
  festival_type TEXT NOT NULL,
  genre_id TEXT REFERENCES genres(id),
  venue_id TEXT REFERENCES venues(id),
  status TEXT NOT NULL DEFAULT 'active',
  is_player_controlled INTEGER NOT NULL DEFAULT 0 CHECK(is_player_controlled IN (0,1)),
  capacity INTEGER NOT NULL,
  attendance INTEGER NOT NULL DEFAULT 0,
  cash_reserves REAL NOT NULL,
  debt REAL NOT NULL DEFAULT 0,
  stage_count INTEGER NOT NULL,
  days INTEGER NOT NULL,
  ticket_price REAL NOT NULL,
  overall_prestige REAL NOT NULL CHECK(overall_prestige BETWEEN 0 AND 100),
  artist_reputation REAL NOT NULL CHECK(artist_reputation BETWEEN 0 AND 100),
  fan_reputation REAL NOT NULL CHECK(fan_reputation BETWEEN 0 AND 100),
  industry_reputation REAL NOT NULL CHECK(industry_reputation BETWEEN 0 AND 100),
  safety_reputation REAL NOT NULL CHECK(safety_reputation BETWEEN 0 AND 100),
  discovery_reputation REAL NOT NULL CHECK(discovery_reputation BETWEEN 0 AND 100),
  authenticity REAL NOT NULL CHECK(authenticity BETWEEN 0 AND 100),
  commercialism REAL NOT NULL CHECK(commercialism BETWEEN 0 AND 100),
  sustainability REAL NOT NULL CHECK(sustainability BETWEEN 0 AND 100),
  luxury REAL NOT NULL CHECK(luxury BETWEEN 0 AND 100),
  inclusivity REAL NOT NULL CHECK(inclusivity BETWEEN 0 AND 100),
  party_atmosphere REAL NOT NULL CHECK(party_atmosphere BETWEEN 0 AND 100),
  community_connection REAL NOT NULL CHECK(community_connection BETWEEN 0 AND 100),
  production_quality INTEGER NOT NULL CHECK(production_quality BETWEEN 1 AND 20),
  security_quality INTEGER NOT NULL CHECK(security_quality BETWEEN 1 AND 20),
  transport_quality INTEGER NOT NULL CHECK(transport_quality BETWEEN 1 AND 20),
  camping_quality INTEGER NOT NULL CHECK(camping_quality BETWEEN 1 AND 20),
  sanitation_quality INTEGER NOT NULL CHECK(sanitation_quality BETWEEN 1 AND 20),
  food_quality INTEGER NOT NULL CHECK(food_quality BETWEEN 1 AND 20),
  accessibility INTEGER NOT NULL CHECK(accessibility BETWEEN 1 AND 20),
  medical_quality INTEGER NOT NULL CHECK(medical_quality BETWEEN 1 AND 20),
  weather_resilience INTEGER NOT NULL CHECK(weather_resilience BETWEEN 1 AND 20),
  queue_management INTEGER NOT NULL CHECK(queue_management BETWEEN 1 AND 20),
  followers INTEGER NOT NULL DEFAULT 0,
  mailing_list INTEGER NOT NULL DEFAULT 0,
  customer_loyalty REAL NOT NULL CHECK(customer_loyalty BETWEEN 0 AND 100),
  spending_power REAL NOT NULL CHECK(spending_power BETWEEN 0 AND 100),
  travel_tolerance REAL NOT NULL CHECK(travel_tolerance BETWEEN 0 AND 100),
  price_tolerance REAL NOT NULL CHECK(price_tolerance BETWEEN 0 AND 100),
  sponsor_tolerance REAL NOT NULL CHECK(sponsor_tolerance BETWEEN 0 AND 100),
  risk_tolerance INTEGER NOT NULL CHECK(risk_tolerance BETWEEN 1 AND 20),
  aggression INTEGER NOT NULL CHECK(aggression BETWEEN 1 AND 20),
  expansion_ambition INTEGER NOT NULL CHECK(expansion_ambition BETWEEN 1 AND 20),
  discovery_focus INTEGER NOT NULL CHECK(discovery_focus BETWEEN 1 AND 20),
  profit_focus INTEGER NOT NULL CHECK(profit_focus BETWEEN 1 AND 20),
  prestige_focus INTEGER NOT NULL CHECK(prestige_focus BETWEEN 1 AND 20)
);

CREATE TABLE IF NOT EXISTS sponsors (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  size TEXT NOT NULL,
  region TEXT NOT NULL,
  brand_reputation REAL NOT NULL CHECK(brand_reputation BETWEEN 0 AND 100),
  annual_budget REAL NOT NULL,
  minimum_offer REAL NOT NULL,
  maximum_offer REAL NOT NULL,
  desired_impressions INTEGER NOT NULL,
  attendance_requirement INTEGER NOT NULL,
  preferred_contract_years INTEGER NOT NULL,
  corporate_level REAL NOT NULL CHECK(corporate_level BETWEEN 0 AND 100),
  fan_approval REAL NOT NULL CHECK(fan_approval BETWEEN 0 AND 100),
  ethical_reputation REAL NOT NULL CHECK(ethical_reputation BETWEEN 0 AND 100),
  sustainability_reputation REAL NOT NULL CHECK(sustainability_reputation BETWEEN 0 AND 100),
  youth_appeal REAL NOT NULL CHECK(youth_appeal BETWEEN 0 AND 100),
  luxury_appeal REAL NOT NULL CHECK(luxury_appeal BETWEEN 0 AND 100),
  genre_fit REAL NOT NULL CHECK(genre_fit BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'available'
);

CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
  employer_festival_id TEXT REFERENCES festivals(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  birth_year INTEGER NOT NULL,
  role_id TEXT REFERENCES staff_roles(id),
  contract_end_year INTEGER,
  salary REAL NOT NULL,
  reputation REAL NOT NULL CHECK(reputation BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'available',
  negotiation INTEGER NOT NULL CHECK(negotiation BETWEEN 1 AND 20),
  judgement INTEGER NOT NULL CHECK(judgement BETWEEN 1 AND 20),
  potential_assessment INTEGER NOT NULL CHECK(potential_assessment BETWEEN 1 AND 20),
  genre_knowledge INTEGER NOT NULL CHECK(genre_knowledge BETWEEN 1 AND 20),
  regional_knowledge INTEGER NOT NULL CHECK(regional_knowledge BETWEEN 1 AND 20),
  marketing INTEGER NOT NULL CHECK(marketing BETWEEN 1 AND 20),
  operations INTEGER NOT NULL CHECK(operations BETWEEN 1 AND 20),
  financial_management INTEGER NOT NULL CHECK(financial_management BETWEEN 1 AND 20),
  security INTEGER NOT NULL CHECK(security BETWEEN 1 AND 20),
  production INTEGER NOT NULL CHECK(production BETWEEN 1 AND 20),
  leadership INTEGER NOT NULL CHECK(leadership BETWEEN 1 AND 20),
  professionalism INTEGER NOT NULL CHECK(professionalism BETWEEN 1 AND 20),
  loyalty INTEGER NOT NULL CHECK(loyalty BETWEEN 1 AND 20),
  ambition INTEGER NOT NULL CHECK(ambition BETWEEN 1 AND 20),
  morale REAL NOT NULL CHECK(morale BETWEEN 0 AND 100),
  fatigue REAL NOT NULL CHECK(fatigue BETWEEN 0 AND 100),
  workload REAL NOT NULL CHECK(workload BETWEEN 0 AND 100),
  job_satisfaction REAL NOT NULL CHECK(job_satisfaction BETWEEN 0 AND 100),
  rival_interest REAL NOT NULL CHECK(rival_interest BETWEEN 0 AND 100)
);

CREATE TABLE IF NOT EXISTS traits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  entity_type TEXT NOT NULL,
  polarity TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS entity_traits (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  trait_id TEXT NOT NULL REFERENCES traits(id),
  strength REAL NOT NULL DEFAULT 1,
  UNIQUE(save_id, entity_type, entity_id, trait_id)
);

CREATE TABLE IF NOT EXISTS relationships (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
  source_entity_type TEXT NOT NULL,
  source_entity_id TEXT NOT NULL,
  target_entity_type TEXT NOT NULL,
  target_entity_id TEXT NOT NULL,
  trust REAL NOT NULL CHECK(trust BETWEEN 0 AND 100),
  respect REAL NOT NULL CHECK(respect BETWEEN 0 AND 100),
  familiarity REAL NOT NULL CHECK(familiarity BETWEEN 0 AND 100),
  commercial_value REAL NOT NULL CHECK(commercial_value BETWEEN 0 AND 100),
  overall_score REAL NOT NULL CHECK(overall_score BETWEEN 0 AND 100),
  last_interaction_week INTEGER NOT NULL DEFAULT 0,
  UNIQUE(save_id, source_entity_type, source_entity_id, target_entity_type, target_entity_id)
);

CREATE TABLE IF NOT EXISTS relationship_memories (
  id TEXT PRIMARY KEY,
  relationship_id TEXT NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL,
  value REAL NOT NULL,
  description TEXT NOT NULL,
  created_week INTEGER NOT NULL,
  decay_per_week REAL NOT NULL DEFAULT 0,
  is_permanent INTEGER NOT NULL DEFAULT 0 CHECK(is_permanent IN (0,1))
);

CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
  contract_type TEXT NOT NULL,
  party_a_type TEXT NOT NULL,
  party_a_id TEXT NOT NULL,
  party_b_type TEXT NOT NULL,
  party_b_id TEXT NOT NULL,
  start_week INTEGER NOT NULL,
  end_week INTEGER,
  base_value REAL NOT NULL,
  status TEXT NOT NULL,
  terms_json TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
  festival_id TEXT NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  band_id TEXT NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  edition_year INTEGER NOT NULL,
  stage_name TEXT NOT NULL,
  slot_level INTEGER NOT NULL,
  fee REAL NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scheduled_events (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
  execute_week INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  entity_ids_json TEXT NOT NULL DEFAULT '[]',
  payload_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'scheduled'
);

CREATE TABLE IF NOT EXISTS story_arcs (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
  arc_type TEXT NOT NULL,
  participant_ids_json TEXT NOT NULL,
  stage INTEGER NOT NULL DEFAULT 0,
  severity INTEGER NOT NULL DEFAULT 1,
  start_week INTEGER NOT NULL,
  next_evaluation_week INTEGER NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0,1)),
  state_json TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS simulation_events (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
  week INTEGER NOT NULL,
  year INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  severity INTEGER NOT NULL,
  entity_ids_json TEXT NOT NULL,
  data_json TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS history_entries (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
  week INTEGER NOT NULL,
  year INTEGER NOT NULL,
  category TEXT NOT NULL,
  entity_ids_json TEXT NOT NULL,
  summary TEXT NOT NULL,
  simulation_event_id TEXT REFERENCES simulation_events(id)
);

CREATE TABLE IF NOT EXISTS financial_transactions (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  week INTEGER NOT NULL,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS festival_band_knowledge (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
  festival_id TEXT NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  band_id TEXT NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  current_min REAL NOT NULL,
  current_max REAL NOT NULL,
  potential_min REAL NOT NULL,
  potential_max REAL NOT NULL,
  confidence REAL NOT NULL CHECK(confidence BETWEEN 0 AND 100),
  known_traits_json TEXT NOT NULL DEFAULT '[]',
  last_observed_week INTEGER NOT NULL,
  UNIQUE(save_id, festival_id, band_id)
);

CREATE TABLE IF NOT EXISTS yearly_snapshots (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  snapshot_type TEXT NOT NULL,
  data_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(save_id, year, snapshot_type)
);

CREATE INDEX IF NOT EXISTS idx_bands_save_status ON bands(save_id, status);
CREATE INDEX IF NOT EXISTS idx_members_band_status ON band_members(band_id, status);
CREATE INDEX IF NOT EXISTS idx_festivals_save_status ON festivals(save_id, status);
CREATE INDEX IF NOT EXISTS idx_events_save_week ON simulation_events(save_id, week);
CREATE INDEX IF NOT EXISTS idx_story_arcs_due ON story_arcs(save_id, is_active, next_evaluation_week);
