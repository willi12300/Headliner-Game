PRAGMA foreign_keys = ON;

-- Headliner Data Dictionary v1 extension.
-- This migration adds normalized identity, health, membership, release,
-- scouting, negotiation, ticketing and narrative tables without deleting
-- the working Simulation Lab schema created by migrations 001-002.

CREATE TABLE IF NOT EXISTS countries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  iso_code TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS regions (
  id TEXT PRIMARY KEY,
  country_id TEXT NOT NULL REFERENCES countries(id),
  name TEXT NOT NULL,
  population INTEGER NOT NULL DEFAULT 0 CHECK(population >= 0),
  cost_index REAL NOT NULL DEFAULT 100 CHECK(cost_index >= 0),
  travel_access REAL NOT NULL DEFAULT 50 CHECK(travel_access BETWEEN 0 AND 100),
  media_reach REAL NOT NULL DEFAULT 50 CHECK(media_reach BETWEEN 0 AND 100),
  festival_regulation REAL NOT NULL DEFAULT 50 CHECK(festival_regulation BETWEEN 0 AND 100),
  weather_profile_id TEXT,
  UNIQUE(country_id, name)
);

CREATE TABLE IF NOT EXISTS people (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  stage_name TEXT,
  pronouns TEXT NOT NULL DEFAULT 'they/them',
  date_of_birth TEXT NOT NULL,
  nationality_id TEXT REFERENCES countries(id),
  home_region_id TEXT REFERENCES regions(id),
  current_region_id TEXT REFERENCES regions(id),
  public_reputation REAL NOT NULL DEFAULT 0 CHECK(public_reputation BETWEEN 0 AND 100),
  industry_reputation REAL NOT NULL DEFAULT 0 CHECK(industry_reputation BETWEEN 0 AND 100),
  media_profile REAL NOT NULL DEFAULT 0 CHECK(media_profile BETWEEN 0 AND 100),
  wealth_minor INTEGER NOT NULL DEFAULT 0,
  career_status TEXT NOT NULL DEFAULT 'active' CHECK(career_status IN ('active','inactive','retired','deceased')),
  avatar_asset_id TEXT,
  biography TEXT NOT NULL DEFAULT '',
  created_week INTEGER NOT NULL DEFAULT 0 CHECK(created_week >= 0),
  retired_week INTEGER,
  is_archived INTEGER NOT NULL DEFAULT 0 CHECK(is_archived IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS person_attributes (
  person_id TEXT PRIMARY KEY REFERENCES people(id) ON DELETE CASCADE,
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
  pressure_handling INTEGER NOT NULL CHECK(pressure_handling BETWEEN 1 AND 20),
  honesty INTEGER NOT NULL CHECK(honesty BETWEEN 1 AND 20),
  patience INTEGER NOT NULL CHECK(patience BETWEEN 1 AND 20),
  risk_tolerance INTEGER NOT NULL CHECK(risk_tolerance BETWEEN 1 AND 20),
  commercial_appetite INTEGER NOT NULL CHECK(commercial_appetite BETWEEN 1 AND 20),
  artistic_integrity INTEGER NOT NULL CHECK(artistic_integrity BETWEEN 1 AND 20),
  social_confidence INTEGER NOT NULL CHECK(social_confidence BETWEEN 1 AND 20),
  controversy_tendency INTEGER NOT NULL CHECK(controversy_tendency BETWEEN 1 AND 20),
  stress_sensitivity INTEGER NOT NULL CHECK(stress_sensitivity BETWEEN 1 AND 20),
  lifestyle_discipline INTEGER NOT NULL CHECK(lifestyle_discipline BETWEEN 1 AND 20)
);

CREATE TABLE IF NOT EXISTS person_health (
  person_id TEXT PRIMARY KEY REFERENCES people(id) ON DELETE CASCADE,
  general_health REAL NOT NULL DEFAULT 100 CHECK(general_health BETWEEN 0 AND 100),
  fatigue REAL NOT NULL DEFAULT 0 CHECK(fatigue BETWEEN 0 AND 100),
  fitness REAL NOT NULL DEFAULT 70 CHECK(fitness BETWEEN 0 AND 100),
  stress REAL NOT NULL DEFAULT 0 CHECK(stress BETWEEN 0 AND 100),
  voice_condition REAL NOT NULL DEFAULT 100 CHECK(voice_condition BETWEEN 0 AND 100),
  hearing_condition REAL NOT NULL DEFAULT 100 CHECK(hearing_condition BETWEEN 0 AND 100),
  injury_susceptibility INTEGER NOT NULL DEFAULT 10 CHECK(injury_susceptibility BETWEEN 1 AND 20),
  tour_endurance INTEGER NOT NULL DEFAULT 10 CHECK(tour_endurance BETWEEN 1 AND 20),
  recovery_rate INTEGER NOT NULL DEFAULT 10 CHECK(recovery_rate BETWEEN 1 AND 20),
  active_condition_id TEXT,
  unavailable_until_week INTEGER
);

CREATE TABLE IF NOT EXISTS band_member_profiles (
  member_id TEXT PRIMARY KEY REFERENCES band_members(id) ON DELETE CASCADE,
  person_id TEXT UNIQUE REFERENCES people(id) ON DELETE SET NULL,
  primary_role_id TEXT REFERENCES member_roles(id),
  secondary_role_ids_json TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(secondary_role_ids_json)),
  development_rate REAL NOT NULL DEFAULT 1 CHECK(development_rate BETWEEN 0 AND 2),
  decline_rate REAL NOT NULL DEFAULT 1 CHECK(decline_rate BETWEEN 0 AND 2),
  experience REAL NOT NULL DEFAULT 0 CHECK(experience BETWEEN 0 AND 100),
  creative_control_desire REAL NOT NULL DEFAULT 50 CHECK(creative_control_desire BETWEEN 0 AND 100),
  solo_career_desire REAL NOT NULL DEFAULT 0 CHECK(solo_career_desire BETWEEN 0 AND 100),
  contract_satisfaction REAL NOT NULL DEFAULT 50 CHECK(contract_satisfaction BETWEEN 0 AND 100),
  role_satisfaction REAL NOT NULL DEFAULT 50 CHECK(role_satisfaction BETWEEN 0 AND 100),
  public_popularity REAL NOT NULL DEFAULT 0 CHECK(public_popularity BETWEEN 0 AND 100),
  media_interest REAL NOT NULL DEFAULT 0 CHECK(media_interest BETWEEN 0 AND 100),
  solo_followers INTEGER NOT NULL DEFAULT 0 CHECK(solo_followers >= 0)
);

CREATE TABLE IF NOT EXISTS band_memberships (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
  band_id TEXT NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL REFERENCES band_members(id) ON DELETE CASCADE,
  role_id TEXT REFERENCES member_roles(id),
  joined_week INTEGER NOT NULL CHECK(joined_week >= 0),
  left_week INTEGER,
  departure_reason TEXT,
  is_founder INTEGER NOT NULL DEFAULT 0 CHECK(is_founder IN (0,1)),
  was_publicly_announced INTEGER NOT NULL DEFAULT 1 CHECK(was_publicly_announced IN (0,1)),
  legacy_importance REAL NOT NULL DEFAULT 0 CHECK(legacy_importance BETWEEN 0 AND 100)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_band_membership_active
ON band_memberships(member_id)
WHERE left_week IS NULL;

CREATE TABLE IF NOT EXISTS releases (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
  artist_entity_type TEXT NOT NULL CHECK(artist_entity_type IN ('band','solo_artist')),
  artist_entity_id TEXT NOT NULL,
  release_type TEXT NOT NULL CHECK(release_type IN ('single','ep','album','live','remix','collaboration')),
  title TEXT NOT NULL,
  announcement_week INTEGER,
  release_week INTEGER NOT NULL,
  label_id TEXT REFERENCES labels(id) ON DELETE SET NULL,
  production_quality REAL NOT NULL CHECK(production_quality BETWEEN 0 AND 100),
  songwriting_quality REAL NOT NULL CHECK(songwriting_quality BETWEEN 0 AND 100),
  critical_quality REAL NOT NULL DEFAULT 0 CHECK(critical_quality BETWEEN 0 AND 100),
  commercial_performance REAL NOT NULL DEFAULT 0 CHECK(commercial_performance BETWEEN 0 AND 100),
  marketing_spend_minor INTEGER NOT NULL DEFAULT 0 CHECK(marketing_spend_minor >= 0),
  stream_count INTEGER NOT NULL DEFAULT 0 CHECK(stream_count >= 0),
  sales_count INTEGER NOT NULL DEFAULT 0 CHECK(sales_count >= 0),
  viral_score REAL NOT NULL DEFAULT 0 CHECK(viral_score BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'planned' CHECK(status IN ('planned','announced','released','delayed','cancelled')),
  genre_id TEXT REFERENCES genres(id),
  source_story_arc_id TEXT REFERENCES story_arcs(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS regional_scenes (
  save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
  region_id TEXT NOT NULL REFERENCES regions(id),
  genre_id TEXT NOT NULL REFERENCES genres(id),
  scene_strength REAL NOT NULL DEFAULT 30 CHECK(scene_strength BETWEEN 0 AND 100),
  fan_engagement REAL NOT NULL DEFAULT 30 CHECK(fan_engagement BETWEEN 0 AND 100),
  active_band_count INTEGER NOT NULL DEFAULT 0 CHECK(active_band_count >= 0),
  venue_support REAL NOT NULL DEFAULT 30 CHECK(venue_support BETWEEN 0 AND 100),
  label_presence REAL NOT NULL DEFAULT 30 CHECK(label_presence BETWEEN 0 AND 100),
  discovery_potential REAL NOT NULL DEFAULT 50 CHECK(discovery_potential BETWEEN 0 AND 100),
  historical_influence REAL NOT NULL DEFAULT 20 CHECK(historical_influence BETWEEN 0 AND 100),
  growth_direction REAL NOT NULL DEFAULT 0 CHECK(growth_direction BETWEEN -100 AND 100),
  PRIMARY KEY(save_id, region_id, genre_id)
);

CREATE TABLE IF NOT EXISTS festival_editions (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
  festival_id TEXT NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  edition_year INTEGER NOT NULL,
  start_week INTEGER NOT NULL,
  end_week INTEGER NOT NULL,
  venue_id TEXT REFERENCES venues(id),
  capacity INTEGER NOT NULL CHECK(capacity >= 0),
  attendance INTEGER NOT NULL DEFAULT 0 CHECK(attendance >= 0),
  ticket_revenue_minor INTEGER NOT NULL DEFAULT 0,
  sponsor_revenue_minor INTEGER NOT NULL DEFAULT 0,
  other_revenue_minor INTEGER NOT NULL DEFAULT 0,
  total_cost_minor INTEGER NOT NULL DEFAULT 0,
  profit_minor INTEGER NOT NULL DEFAULT 0,
  average_review_score REAL CHECK(average_review_score BETWEEN 0 AND 100),
  fan_sentiment REAL CHECK(fan_sentiment BETWEEN 0 AND 100),
  artist_sentiment REAL CHECK(artist_sentiment BETWEEN 0 AND 100),
  weather_summary TEXT,
  incident_count INTEGER NOT NULL DEFAULT 0 CHECK(incident_count >= 0),
  headline_moment TEXT,
  poster_asset_id TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK(status IN ('planned','active','completed','cancelled')),
  UNIQUE(festival_id, edition_year)
);

CREATE TABLE IF NOT EXISTS scouting_assignments (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
  festival_id TEXT NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  scout_staff_id TEXT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  target_entity_type TEXT NOT NULL,
  target_entity_id TEXT,
  assignment_type TEXT NOT NULL,
  start_week INTEGER NOT NULL,
  planned_end_week INTEGER NOT NULL,
  completed_week INTEGER,
  priority INTEGER NOT NULL DEFAULT 3 CHECK(priority BETWEEN 1 AND 5),
  status TEXT NOT NULL DEFAULT 'planned' CHECK(status IN ('planned','active','completed','cancelled')),
  budget_minor INTEGER NOT NULL DEFAULT 0 CHECK(budget_minor >= 0)
);

CREATE TABLE IF NOT EXISTS festival_entity_knowledge (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
  festival_id TEXT NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  knowledge_level REAL NOT NULL DEFAULT 0 CHECK(knowledge_level BETWEEN 0 AND 100),
  confidence REAL NOT NULL DEFAULT 0 CHECK(confidence BETWEEN 0 AND 100),
  last_observed_week INTEGER,
  estimated_current_min REAL,
  estimated_current_max REAL,
  estimated_potential_min REAL,
  estimated_potential_max REAL,
  estimated_fee_min_minor INTEGER,
  estimated_fee_max_minor INTEGER,
  known_trait_ids_json TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(known_trait_ids_json)),
  suspected_trait_ids_json TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(suspected_trait_ids_json)),
  known_relationship_ids_json TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(known_relationship_ids_json)),
  risk_summary_json TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(risk_summary_json)),
  source_report_ids_json TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(source_report_ids_json)),
  UNIQUE(save_id, festival_id, entity_type, entity_id)
);

CREATE TABLE IF NOT EXISTS negotiations (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
  subject_type TEXT NOT NULL,
  subject_id TEXT,
  initiator_entity_type TEXT NOT NULL,
  initiator_entity_id TEXT NOT NULL,
  counterparty_entity_type TEXT NOT NULL,
  counterparty_entity_id TEXT NOT NULL,
  started_week INTEGER NOT NULL,
  last_offer_week INTEGER NOT NULL,
  round_count INTEGER NOT NULL DEFAULT 0 CHECK(round_count >= 0),
  relationship_at_start REAL NOT NULL CHECK(relationship_at_start BETWEEN 0 AND 100),
  counterparty_patience REAL NOT NULL CHECK(counterparty_patience BETWEEN 0 AND 100),
  counterparty_interest REAL NOT NULL CHECK(counterparty_interest BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','accepted','rejected','withdrawn','expired')),
  current_offer_json TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(current_offer_json)),
  minimum_acceptance_json TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(minimum_acceptance_json)),
  history_json TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(history_json))
);

CREATE TABLE IF NOT EXISTS ticket_products (
  id TEXT PRIMARY KEY,
  festival_edition_id TEXT NOT NULL REFERENCES festival_editions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ticket_type TEXT NOT NULL CHECK(ticket_type IN ('day','weekend','camping','vip','payment_plan')),
  price_minor INTEGER NOT NULL CHECK(price_minor >= 0),
  quantity_available INTEGER NOT NULL CHECK(quantity_available >= 0),
  quantity_sold INTEGER NOT NULL DEFAULT 0 CHECK(quantity_sold >= 0 AND quantity_sold <= quantity_available),
  sale_start_week INTEGER NOT NULL,
  sale_end_week INTEGER NOT NULL,
  refundability TEXT NOT NULL DEFAULT 'standard',
  status TEXT NOT NULL DEFAULT 'planned' CHECK(status IN ('planned','on_sale','sold_out','closed'))
);

CREATE TABLE IF NOT EXISTS ticket_demand_snapshots (
  id TEXT PRIMARY KEY,
  festival_edition_id TEXT NOT NULL REFERENCES festival_editions(id) ON DELETE CASCADE,
  week INTEGER NOT NULL,
  base_demand REAL NOT NULL CHECK(base_demand >= 0),
  lineup_multiplier REAL NOT NULL DEFAULT 1 CHECK(lineup_multiplier >= 0),
  price_multiplier REAL NOT NULL DEFAULT 1 CHECK(price_multiplier >= 0),
  reputation_multiplier REAL NOT NULL DEFAULT 1 CHECK(reputation_multiplier >= 0),
  marketing_multiplier REAL NOT NULL DEFAULT 1 CHECK(marketing_multiplier >= 0),
  sentiment_multiplier REAL NOT NULL DEFAULT 1 CHECK(sentiment_multiplier >= 0),
  competition_multiplier REAL NOT NULL DEFAULT 1 CHECK(competition_multiplier >= 0),
  weather_multiplier REAL NOT NULL DEFAULT 1 CHECK(weather_multiplier >= 0),
  economic_multiplier REAL NOT NULL DEFAULT 1 CHECK(economic_multiplier >= 0),
  calculated_demand REAL NOT NULL CHECK(calculated_demand >= 0),
  tickets_sold INTEGER NOT NULL DEFAULT 0 CHECK(tickets_sold >= 0),
  breakdown_json TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(breakdown_json)),
  UNIQUE(festival_edition_id, week)
);

CREATE TABLE IF NOT EXISTS news_stories (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
  week INTEGER NOT NULL,
  media_outlet_id TEXT,
  headline TEXT NOT NULL,
  body TEXT NOT NULL,
  tone TEXT NOT NULL CHECK(tone IN ('positive','neutral','negative','sensational')),
  importance REAL NOT NULL DEFAULT 50 CHECK(importance BETWEEN 0 AND 100),
  source_event_id TEXT REFERENCES simulation_events(id) ON DELETE SET NULL,
  entity_refs_json TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(entity_refs_json)),
  published INTEGER NOT NULL DEFAULT 1 CHECK(published IN (0,1))
);

CREATE TABLE IF NOT EXISTS social_posts (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
  week INTEGER NOT NULL,
  account_entity_type TEXT NOT NULL,
  account_entity_id TEXT,
  handle TEXT NOT NULL,
  body TEXT NOT NULL,
  tone TEXT NOT NULL CHECK(tone IN ('positive','neutral','negative','sarcastic','hype')),
  likes INTEGER NOT NULL DEFAULT 0 CHECK(likes >= 0),
  comments INTEGER NOT NULL DEFAULT 0 CHECK(comments >= 0),
  shares INTEGER NOT NULL DEFAULT 0 CHECK(shares >= 0),
  source_event_id TEXT REFERENCES simulation_events(id) ON DELETE SET NULL,
  entity_refs_json TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(entity_refs_json))
);

CREATE TABLE IF NOT EXISTS inbox_messages (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
  recipient_entity_type TEXT NOT NULL,
  recipient_entity_id TEXT NOT NULL,
  sender_entity_type TEXT NOT NULL,
  sender_entity_id TEXT,
  week INTEGER NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK(message_type IN ('alert','report','negotiation','board','staff','news','task')),
  importance INTEGER NOT NULL DEFAULT 1 CHECK(importance BETWEEN 1 AND 5),
  is_read INTEGER NOT NULL DEFAULT 0 CHECK(is_read IN (0,1)),
  action_required INTEGER NOT NULL DEFAULT 0 CHECK(action_required IN (0,1)),
  deadline_week INTEGER,
  source_event_id TEXT REFERENCES simulation_events(id) ON DELETE SET NULL,
  action_payload_json TEXT CHECK(action_payload_json IS NULL OR json_valid(action_payload_json))
);

CREATE INDEX IF NOT EXISTS idx_people_save_status ON people(save_id, career_status);
CREATE INDEX IF NOT EXISTS idx_memberships_band_active ON band_memberships(band_id, left_week);
CREATE INDEX IF NOT EXISTS idx_releases_artist_week ON releases(artist_entity_type, artist_entity_id, release_week);
CREATE INDEX IF NOT EXISTS idx_scouting_assignments_status ON scouting_assignments(save_id, status, planned_end_week);
CREATE INDEX IF NOT EXISTS idx_entity_knowledge_lookup ON festival_entity_knowledge(festival_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_negotiations_status ON negotiations(save_id, status, last_offer_week);
CREATE INDEX IF NOT EXISTS idx_news_week ON news_stories(save_id, week DESC);
CREATE INDEX IF NOT EXISTS idx_social_week ON social_posts(save_id, week DESC);
CREATE INDEX IF NOT EXISTS idx_inbox_recipient ON inbox_messages(recipient_entity_type, recipient_entity_id, is_read, week DESC);
