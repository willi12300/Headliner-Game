# HEADLINER DATA DICTIONARY V1

**Project:** Headliner  
**Version:** 1.0  
**Derived from:** Headliner Design Bible v1  
**Primary database:** SQLite  
**Application types:** TypeScript  

## 1. Purpose

This document defines the canonical entities, fields, types, ranges, visibility, storage rules and history requirements for Headliner. The SQLite schema, TypeScript models, procedural generators and simulation engines must follow this specification.

## 2. Classification system

### Storage

- **STORED:** persisted as source truth.
- **DERIVED:** recalculated and not stored as independent truth.
- **CACHED DERIVED:** stored for performance but reproducible from source fields.
- **EVENT-SOURCED:** current value stored while meaningful changes are also recorded as events.

### Player visibility

- **PUBLIC:** normally visible.
- **SCOUTED:** visible only with sufficient knowledge.
- **PARTIAL:** shown as ranges, stars, descriptions or confidence.
- **PRIVATE:** simulation-only truth.
- **DEVELOPER:** Simulation Lab/debug only.

### History

- **NONE, EVENT, WEEKLY, MONTHLY, SEASONAL, YEARLY.**

### Shared numeric scales

- **ATTRIBUTE_1_20:** human skills and personality.
- **SCORE_0_100:** state, reputation, health, confidence and relationships.
- **ABILITY_1_100:** hidden ability and potential.
- **PROBABILITY_0_1:** probability values.
- **MONEY_MINOR:** integer minor currency units; £1.00 = 100.
- **WEEK_INDEX:** integer weeks since save start.

## 3. Shared metadata

Every persistent entity should use:

| Field | SQL | TS | Rules |
|---|---|---|---|
| `id` | TEXT | string | UUID or deterministic generated ID; primary key |
| `save_id` | TEXT | string | owning save where applicable |
| `created_at` | TEXT | string | ISO-8601 timestamp |
| `updated_at` | TEXT | string | ISO-8601 timestamp |
| `created_week` | INTEGER | number | week index |
| `retired_week` | INTEGER NULL | number \| null | permanent inactivity week |
| `is_archived` | INTEGER | boolean | archive rather than delete history |

Canonical entity types: `save`, `person`, `band`, `solo_artist`, `label`, `agency`, `agent`, `festival`, `festival_company`, `venue`, `sponsor`, `staff`, `scout`, `media_outlet`, `council`, `supplier`.

---

# 4. Save

**Table:** `saves`

| Field | SQL / TS | Rules | Visibility | History |
|---|---|---|---|---|
| `id` | TEXT / string | PK | DEVELOPER | NONE |
| `name` | TEXT / string | 1–80 chars | PUBLIC | NONE |
| `schema_version` | INTEGER / number | >=1 | DEVELOPER | EVENT |
| `simulation_version` | TEXT / string | semantic version | DEVELOPER | EVENT |
| `content_version` | TEXT / string | semantic version | DEVELOPER | EVENT |
| `initial_seed` | INTEGER / number | unsigned 32-bit | DEVELOPER | NONE |
| `rng_state` | TEXT / string | serialised RNG state | DEVELOPER | WEEKLY |
| `current_week` | INTEGER / number | >=0 | PUBLIC | WEEKLY |
| `current_date` | TEXT / string | ISO date | PUBLIC | WEEKLY |
| `starting_year` | INTEGER / number | configured start year | PUBLIC | NONE |
| `difficulty_id` | TEXT / string | reference | PUBLIC | NONE |
| `player_founder_id` | TEXT / string | FK person | PUBLIC | NONE |
| `player_company_id` | TEXT / string | FK company | PUBLIC | NONE |
| `active_festival_id` | TEXT NULL / string|null | FK festival | PUBLIC | EVENT |
| `last_saved_at` | TEXT / string | ISO timestamp | PUBLIC | NONE |
| `play_time_seconds` | INTEGER / number | >=0 | PUBLIC | NONE |

# 5. Game settings

**Table:** `game_settings`

Fields: `save_id`, `key`, `value_json`, `visibility`, `updated_week`.

Examples: simulation speed, autosave, accessibility, world size, content packs, narrative intensity and incident abstraction.

---

# 6. Person

**Table:** `people`

| Field | Type | Rules | Visibility | History |
|---|---|---|---|---|
| `first_name` | TEXT | 1–50 chars | PUBLIC | NONE |
| `last_name` | TEXT | 1–50 chars | PUBLIC | EVENT |
| `stage_name` | TEXT NULL | 0–80 chars | PUBLIC | EVENT |
| `pronouns` | TEXT | reference | PUBLIC | NONE |
| `date_of_birth` | TEXT | ISO date | PUBLIC/PARTIAL | NONE |
| `nationality_id` | TEXT | FK country | PUBLIC | NONE |
| `home_region_id` | TEXT NULL | FK region | PUBLIC | EVENT |
| `current_region_id` | TEXT NULL | FK region | PARTIAL | EVENT |
| `public_reputation` | REAL | 0–100 | PUBLIC | YEARLY |
| `industry_reputation` | REAL | 0–100 | SCOUTED | YEARLY |
| `media_profile` | REAL | 0–100 | PUBLIC | YEARLY |
| `wealth_minor` | INTEGER | any | PRIVATE | YEARLY |
| `career_status` | TEXT | active, inactive, retired, deceased | PUBLIC | EVENT |
| `avatar_asset_id` | TEXT NULL | asset FK | PUBLIC | EVENT |
| `biography` | TEXT | generated/editable | PUBLIC | EVENT |

# 7. Personality profile

**Table:** `person_attributes`; all values 1–20.

`professionalism`, `ambition`, `loyalty`, `ego`, `resilience`, `consistency`, `adaptability`, `leadership`, `discipline`, `work_ethic`, `pressure_handling`, `honesty`, `patience`, `risk_tolerance`, `commercial_appetite`, `artistic_integrity`, `social_confidence`, `controversy_tendency`, `stress_sensitivity`, `lifestyle_discipline`.

Visibility is PRIVATE or PARTIAL. History is YEARLY. These fields drive development, conflicts, career decisions, negotiation behaviour, health, publicity and relationships.

# 8. Person health

**Table:** `person_health`

| Field | Range | Visibility | History |
|---|---|---|---|
| `general_health` | 0–100 | PARTIAL | WEEKLY |
| `fatigue` | 0–100 | PARTIAL | WEEKLY |
| `fitness` | 0–100 | PARTIAL | MONTHLY |
| `stress` | 0–100 | PARTIAL | WEEKLY |
| `voice_condition` | 0–100 | SCOUTED | WEEKLY |
| `hearing_condition` | 0–100 | PRIVATE | YEARLY |
| `injury_susceptibility` | 1–20 | PRIVATE/PARTIAL | YEARLY |
| `tour_endurance` | 1–20 | PARTIAL | YEARLY |
| `recovery_rate` | 1–20 | PRIVATE | YEARLY |
| `active_condition_id` | nullable FK | PARTIAL | EVENT |
| `unavailable_until_week` | nullable week | PUBLIC | EVENT |

---

# 9. Band member

**Tables:** `band_members`, `band_member_skills`, `band_memberships`

## Core fields

`person_id`, `current_band_id`, `primary_role_id`, `secondary_role_ids_json`, `career_status`, `current_ability`, `potential_ability`, `development_rate`, `decline_rate`, `experience`, `creative_control_desire`, `solo_career_desire`, `band_satisfaction`, `contract_satisfaction`, `role_satisfaction`, `public_popularity`, `media_interest`, `solo_followers`.

- Ability and potential: 1–100, PRIVATE.
- Satisfaction and experience: 0–100, PARTIAL or PRIVATE.
- Career status: active, inactive, solo, retired.
- Ability and state history: YEARLY or WEEKLY as appropriate.

## Skills, all 1–20

`vocals`, `instrument_skill`, `songwriting`, `composition`, `production`, `creativity`, `improvisation`, `stage_presence`, `crowd_interaction`, `media_ability`, `technical_reliability`, `genre_fluency`, `rehearsal_efficiency`, `live_adaptability`.

## Membership history

`band_id`, `member_id`, `role_id`, `joined_week`, `left_week`, `departure_reason`, `is_founder`, `was_publicly_announced`, `legacy_importance`.

---

# 10. Band

**Tables:** `bands`, `band_state`

## Identity and organisation

`name`, `slug`, `formation_week`, `origin_region_id`, `current_region_id`, `primary_genre_id`, `subgenre_id`, `label_id`, `agent_id`, `manager_person_id`, `career_status`, `image_asset_id`, `biography`.

Career status: forming, active, hiatus, split, retired, reunited.

## Ability and career

| Field | Range | Storage | Visibility | History |
|---|---|---|---|---|
| `current_ability` | 1–100 | CACHED DERIVED | PRIVATE | YEARLY |
| `potential_ability` | 1–100 | CACHED DERIVED | PRIVATE | YEARLY |
| `live_ability` | 1–100 | CACHED DERIVED | PARTIAL | YEARLY |
| `studio_ability` | 1–100 | CACHED DERIVED | PARTIAL | YEARLY |
| `songwriting_ability` | 1–100 | CACHED DERIVED | PARTIAL | YEARLY |
| `commercial_ability` | 1–100 | CACHED DERIVED | PARTIAL | YEARLY |
| `popularity` | 0–100 | EVENT-SOURCED | PUBLIC | MONTHLY |
| `reputation` | 0–100 | EVENT-SOURCED | PUBLIC | YEARLY |
| `momentum` | 0–100 | EVENT-SOURCED | PARTIAL | WEEKLY |
| `followers` | >=0 | EVENT-SOURCED | PUBLIC | MONTHLY |
| `monthly_listeners` | >=0 | EVENT-SOURCED | PUBLIC | MONTHLY |
| `fan_loyalty` | 0–100 | EVENT-SOURCED | PARTIAL | YEARLY |
| `ticket_draw` | >=0 | CACHED DERIVED | PARTIAL | MONTHLY |
| `merchandise_strength` | 0–100 | EVENT-SOURCED | SCOUTED | YEARLY |
| `press_interest` | 0–100 | EVENT-SOURCED | PUBLIC | MONTHLY |
| `industry_interest` | 0–100 | EVENT-SOURCED | PRIVATE/PARTIAL | MONTHLY |
| `asking_fee_minor` | >=0 | CACHED DERIVED | PARTIAL | MONTHLY |
| `financial_health` | 0–100 | EVENT-SOURCED | PRIVATE | MONTHLY |
| `cash_minor` | any | STORED | PRIVATE | MONTHLY |
| `tour_load` | 0–100 | EVENT-SOURCED | PARTIAL | WEEKLY |
| `consecutive_show_count` | >=0 | STORED | PRIVATE | WEEKLY |

## Internal state, all 0–100

`chemistry`, `morale`, `fatigue`, `creative_satisfaction`, `financial_satisfaction`, `label_satisfaction`, `agent_satisfaction`, `leadership_stability`, `internal_tension`, `confidence`, `public_sentiment`, `critical_sentiment`, `schedule_satisfaction`.

---

# 11. Traits

**Tables:** `traits`, `trait_assignments`

Trait definitions contain `id`, `entity_type`, `name`, `description`, `visibility`, `rarity`, `stacking_rule`, `effects_json`, `is_active`.

Assignments contain `entity_type`, `entity_id`, `trait_id`, `strength`, `acquired_week`, `removed_week`, `source_event_id`, `is_known_to_player`.

Supported entity types: band, member, agent, label, festival, staff, venue.

---

# 12. Solo artist

**Table:** `solo_artists`

References one person and mirrors band career fields: `label_id`, `agent_id`, `current_ability`, `potential_ability`, `live_ability`, `studio_ability`, `popularity`, `momentum`, `followers`, `monthly_listeners`, `ticket_draw`, `asking_fee_minor`, `career_status`, `tour_load`.

---

# 13. Genre and regional scene

**Tables:** `genres`, `regions`, `regional_scenes`

## Genre

`name`, `parent_genre_id`, `mainstream_popularity`, `underground_credibility`, `growth_direction` (-100 to 100), `festival_demand`, `sponsor_attractiveness`, `media_interest`, `average_audience_age`, `crossover_potential`, `formation_rate`, `volatility`.

## Region

`name`, `country_id`, `population`, `cost_index`, `travel_access`, `media_reach`, `festival_regulation`, `weather_profile_id`.

## Regional scene

Composite region/genre fields: `scene_strength`, `fan_engagement`, `active_band_count`, `venue_support`, `label_presence`, `discovery_potential`, `historical_influence`, `growth_direction`.

Genre and scene values are PUBLIC and tracked MONTHLY or YEARLY.

---

# 14. Release

**Table:** `releases`

Fields: `artist_entity_type`, `artist_entity_id`, `release_type`, `title`, `announcement_week`, `release_week`, `label_id`, `production_quality`, `songwriting_quality`, `critical_quality`, `commercial_performance`, `marketing_spend_minor`, `stream_count`, `sales_count`, `viral_score`, `status`, `genre_id`, `source_story_arc_id`.

Release type: single, EP, album, live, remix, collaboration. Status: planned, announced, released, delayed, cancelled.

---

# 15. Label

**Table:** `labels`

Fields: `name`, `founded_week`, `headquarters_region_id`, `size_tier`, `cash_minor`, `debt_minor`, `annual_revenue_minor`, `artist_investment_budget_minor`, `marketing_budget_minor`, `reputation`, `authenticity`, `commercial_focus`, `discovery_focus`, `genre_purity`, `artist_development_quality`, `international_ambition`, `risk_tolerance`, `festival_friendliness`, `status`.

Size: micro, indie, respected_indie, regional_major, global_major. Status: active, distressed, collapsed, acquired.

---

# 16. Agency and agent

**Tables:** `agencies`, `agents`

Agency fields: `name`, `headquarters_region_id`, `reputation`, `cash_minor`, `client_capacity`, `genre_focus_id`, `international_reach`, `status`.

Agent fields: `person_id`, `agency_id`, `reputation`, `negotiation`, `industry_contacts`, `artist_judgement`, `commercial_judgement`, `patience`, `greed`, `aggression`, `loyalty`, `honesty`, `professionalism`, `package_deal_tendency`, `prestige_focus`, `fee_focus`, `client_count` derived.

Agent skills are 1–20; reputation is 0–100.

---

# 17. Festival company

**Table:** `festival_companies`

Fields: `name`, `founded_week`, `owner_person_id`, `cash_minor`, `debt_minor`, `credit_limit_minor`, `reputation`, `industry_power`, `risk_appetite`, `expansion_ambition`, `shared_staff_policy`, `status`, `is_player_controlled`.

Status: active, distressed, administration, sold, dissolved.

---

# 18. Festival

**Tables:** `festivals`, `festival_identity`, `festival_audience_profiles`, `festival_editions`

## Core fields

`company_id`, `name`, `founded_week`, `region_id`, `festival_type_id`, `primary_genre_id`, `venue_id`, `status`, `capacity`, `licensed_capacity`, `attendance_last_edition`, `ticket_price_minor`, `cash_minor`, `debt_minor`, `booking_budget_minor`, `stage_count`, `day_count`, `follower_count`, `mailing_list_count`, `customer_loyalty`, `logo_asset_id`, `brand_palette_json`, `brand_style_id`, `is_player_controlled`.

Status: planned, active, paused, cancelled, collapsed, sold.

## Identity dimensions, all 0–100

`authenticity`, `commercialism`, `discovery_credibility`, `prestige`, `artist_friendliness`, `fan_trust`, `safety_reputation`, `sustainability`, `inclusivity`, `luxury`, `party_atmosphere`, `community_connection`, `production_quality`, `cultural_relevance`, `operational_reliability`, `weather_resilience`, `innovation`.

## Audience profile

`average_age`, `spending_power`, `travel_tolerance`, `price_tolerance`, `sponsor_tolerance`, `camping_preference`, `luxury_preference`, `discovery_interest`, `loyalty`, `social_engagement`, `genre_preferences_json`, `region_distribution_json`, `age_distribution_json`.

## Edition

`festival_id`, `edition_year`, `start_week`, `end_week`, `venue_id`, `capacity`, `attendance`, `ticket_revenue_minor`, `sponsor_revenue_minor`, `other_revenue_minor`, `total_cost_minor`, `profit_minor`, `average_review_score`, `fan_sentiment`, `artist_sentiment`, `weather_summary`, `incident_count`, `headline_moment`, `poster_asset_id`, `status`.

---

# 19. Venue

**Table:** `venues`

Fields: `name`, `region_id`, `venue_type_id`, `owner_entity_type`, `owner_entity_id`, `maximum_capacity`, `licensed_capacity`, `camping_capacity`, `parking_capacity`, `stage_capacity`, `power_quality`, `water_quality`, `drainage`, `mobile_signal`, `emergency_access`, `transport_quality`, `noise_restriction`, `curfew_hour`, `council_difficulty`, `environmental_sensitivity`, `flood_risk`, `wind_exposure`, `heat_exposure`, `ground_durability`, `neighbour_tolerance`, `natural_beauty`, `uniqueness`, `brand_potential`, `expansion_potential`, `rent_cost_minor`, `purchase_cost_minor`, `deposit_minor`, `insurance_requirement_minor`, `status`.

Most qualities use 0–100. Status: available, occupied, unavailable, sold, closed.

---

# 20. Sponsor

**Tables:** `sponsors`, `sponsor_demands`

Sponsor fields: `name`, `industry_id`, `size_tier`, `headquarters_region_id`, `cash_budget_minor`, `brand_reputation`, `ethical_reputation`, `sustainability_reputation`, `youth_appeal`, `luxury_appeal`, `fan_approval`, `desired_impressions`, `minimum_attendance`, `preferred_contract_length`, `risk_tolerance`, `controversy_risk`, `status`.

Demand types: stage naming, category exclusivity, logo placement, social campaign, audience data, VIP allocation, artist interviews, minimum attendance, ticket giveaway. Each demand stores `importance`, optional min/max and `is_negotiable`.

---

# 21. Staff and scout

**Tables:** `staff`, `staff_skills`, `scouts`

Staff fields: `person_id`, `company_id`, `festival_id`, `role_id`, `salary_minor_per_week`, `contract_id`, `reputation`, `morale`, `fatigue`, `workload`, `job_satisfaction`, `loyalty_to_employer`, `rival_interest`, `career_ambition`, `status`.

Staff skills, 1–20: `negotiation`, `current_ability_judgement`, `potential_judgement`, `genre_knowledge`, `regional_knowledge`, `networking`, `marketing`, `operations`, `financial_management`, `security`, `production`, `medical_management`, `transport_management`, `leadership`, `professionalism`, `adaptability`, `data_analysis`, `media_handling`, `sponsorship_sales`, `artist_relations`.

Scout extension: `specialist_genre_id`, `specialist_region_id`, `current_assignment_id`, `observation_capacity`, `report_speed`, `bias_strength`, `live_assessment`, `online_scene_assessment`, `networking_reach`.

---

# 22. Scouting

**Tables:** `scouting_assignments`, `festival_entity_knowledge`, `scouting_reports`

Assignment fields: `festival_id`, `scout_id`, `target_entity_type`, `target_entity_id`, `assignment_type`, `start_week`, `planned_end_week`, `completed_week`, `priority`, `status`, `budget_minor`.

Knowledge fields: `festival_id`, `entity_type`, `entity_id`, `knowledge_level`, `confidence`, `last_observed_week`, estimated current/potential min/max, estimated fee min/max, known traits, suspected traits, known relationships, risk summary and source reports.

The actual hidden values must never be copied directly into player knowledge. Knowledge decays over time.

---

# 23. Relationship and memory

**Tables:** `relationships`, `relationship_memories`

Relationship dimensions, all 0–100: `trust`, `respect`, `familiarity`, `affection`, `commercial_value`, `professional_confidence`, `tension`; plus `overall_score` as CACHED DERIVED, `last_interaction_week` and `relationship_status`.

Status: unknown, aware, professional, friendly, trusted, strained, hostile, loyal.

Memory fields: `relationship_id`, `memory_type_id`, `value`, dimensional effects, `created_week`, `decay_per_week`, `is_permanent`, `description`, `source_event_id`, `expires_week`.

---

# 24. Contract, booking and negotiation

**Tables:** `contracts`, `artist_bookings`, `negotiations`

## Contract

`contract_type_id`, both parties, `start_week`, `end_week`, `base_value_minor`, `deposit_minor`, bonus terms, exclusivity, cancellation terms, performance obligations, payment schedule, status, signed/breached weeks.

Contract types: artist booking, sponsorship, staff, site rental, site purchase, supplier, label partnership, agency.

## Artist booking

`festival_edition_id`, artist type/id, `stage_id`, `billing_level`, performance timing, set length, agreed fee, expected draw, announcement week, status, exclusivity radius and weeks.

## Negotiation

`subject_type`, `subject_id`, initiator/counterparty, dates, round count, relationship at start, patience, interest, status, current offer, private minimum acceptance and offer history.

---

# 25. Finance and tickets

**Tables:** `financial_transactions`, `ticket_products`, `ticket_demand_snapshots`

Financial transaction fields: `entity_type`, `entity_id`, `week`, `category_id`, signed `amount_minor`, counterparty, contract, edition, description, projected/confirmed flags.

Ticket product fields: edition, name, type, price, quantity available/sold, sale dates, refundability and status.

Ticket demand snapshots store base demand, lineup, price, reputation, marketing, sentiment, competition, weather and economic multipliers, calculated demand, sales and a developer breakdown.

---

# 26. Event, scheduled event and story arc

**Tables:** `event_definitions`, `simulation_events`, `scheduled_events`, `story_arcs`

Event definitions contain rarity, base probability, cooldown, seasonal cap and references to eligibility, probability, outcome and narrative rules.

Simulation events contain week, type, severity, primary entity, all participants, cause breakdown, payload, visibility and generated presentation flags.

Scheduled events contain execution week, type, participants, payload, status, source event, story arc and priority.

Story arcs contain type, started/resolved weeks, stage, severity, participants, cause state, branch state, next evaluation, status, resolution and historical summary.

---

# 27. Narrative and history

**Tables:** `news_stories`, `social_posts`, `inbox_messages`, `history_entries`

News must reference a real source event. Social posts may reference real entities or generated fan accounts. Inbox messages support sender, recipient, importance, deadline, action and source event. History entries permanently record important career, festival, relationship, contract, incident, award and finance moments.

---

# 28. Snapshots

Required tables:

- `band_yearly_snapshots`
- `member_yearly_snapshots`
- `industry_yearly_snapshots`
- `festival_editions` as permanent seasonal snapshots

Band snapshots store ability, popularity, followers, draw, fee, membership, label, agent, status and genre. Member snapshots store ability, potential, band, role, health, popularity, morale, fatigue and status. Industry snapshots store counts, average fees/prices, money, debt, genre distribution, concentration, inflation and sponsor market health.

---

# 29. Branding

**Tables:** `brand_palettes`, `logo_designs`

Brand palette: primary, secondary, accent, background and text hex values.

Logo design: festival, name, ordered `layers_json`, preview asset, created/retired weeks and primary flag. Layers may include type, shape, symbol, text, font, colour, opacity, rotation, scale, effect and texture.

---

# 30. Derived-value rules

The following must not become disconnected stored truths:

- Band current ability derives from active member skills, role weights, availability, chemistry, morale, health, leadership and production.
- Band potential derives from member potential, age profile, environment, balance and stability.
- Ticket draw derives from popularity, region, genre demand, loyalty, momentum, releases and audience overlap.
- Asking fee derives from draw, popularity, reputation, momentum, agent, label, schedule, exclusivity, rival interest and relationships.
- Festival overall reputation derives from its dimensions.
- Relationship overall score derives from dimensions and memories.
- Displayed stars derive from hidden values, comparison pool and scouting knowledge.

---

# 31. Reference tables

Required: `countries`, `regions`, `genres`, `subgenres`, `member_roles`, `staff_roles`, `festival_types`, `venue_types`, `sponsor_industries`, `contract_types`, `event_types`, `story_arc_types`, `memory_types`, `financial_categories`, `difficulty_profiles`, `brand_styles`, `traits`, `health_conditions`, `media_outlet_types`, `departure_reasons`, `booking_statuses`.

All use stable canonical IDs.

---

# 32. Database invariants

1. A member cannot hold two active primary memberships unless explicitly marked as a side project.
2. An active band must have at least one active member.
3. Ticket sales cannot exceed product inventory.
4. Confirmed bookings require an active contract.
5. Relationships are unique by ordered source/target pair.
6. A memory cannot be duplicated from the same source event.
7. A scheduled event cannot execute twice.
8. A resolved story arc cannot evaluate again.
9. Displayed stars are never source truth.
10. Hidden potential is never copied directly to scouting knowledge.
11. Transactions and cash updates must remain consistent.
12. Each simulation week commits atomically.
13. Historical entities are archived rather than deleted.
14. Snapshot year/entity combinations are unique.
15. RNG state changes only when randomness is consumed.

---

# 33. Database V1 scope

Implement first:

- saves and settings
- people, attributes and health
- bands, members, skills, memberships and state
- traits
- genres, regions and scenes
- releases
- labels, agencies and agents
- companies, festivals, identity, audience and editions
- venues and sponsors
- staff and scouts
- scouting assignments and knowledge
- relationships and memories
- contracts, bookings and negotiations
- finance and tickets
- events, scheduled events and story arcs
- news, social, inbox and history
- yearly snapshots

Defer advanced crowd agents, full family trees, generated audio files, detailed food vendors, 3D site building, tax jurisdictions, multiplayer and workshop systems.

---

# 34. Next implementation documents

1. `HEADLINER_DATABASE_SCHEMA_V1.md`
2. `001_initial_schema.sql`
3. `002_reference_data.sql`
4. TypeScript domain interfaces
5. validation schemas
6. procedural generation rules
7. weekly simulation rules
8. long-run balance tests

---

# 35. Document control

Every change should record date, version, entity, fields added/removed, reason, migration requirement and affected systems.

No field should be added without a clear owner, meaning, range, visibility, history classification, reader and justified writer. This prevents Headliner becoming a collection of disconnected numbers.
