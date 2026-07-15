# Headliner Data Dictionary v1

This document defines the first persistent simulation schema. Attribute scales use **1–20** for human-readable skills and **0–100** for dynamic states, reputation and market measures unless noted.

## saves

| Field | SQL type | Rules | Visibility | Description |
|---|---|---|---|---|
| id | TEXT PK | UUID | internal | Save identifier |
| name | TEXT | required | visible | Save name |
| seed | INTEGER | required | visible | Initial deterministic seed |
| rng_state | INTEGER | required | internal | Current seeded RNG state |
| current_week | INTEGER | >= 0 | visible | Weeks elapsed |
| current_year | INTEGER | >= 1 | visible | Current simulation year |
| schema_version | INTEGER | required | internal | Database schema version |
| simulation_version | TEXT | required | internal | Ruleset version |
| created_at | TEXT | ISO date | visible | Creation timestamp |
| updated_at | TEXT | ISO date | visible | Last update timestamp |

## bands

Identity fields: id, save_id, name, formation_year, home_city, home_country, genre_id, subgenre, status, label_id, agent_id.

Stored ability and career fields: current_ability, potential_ability, live_ability, studio_ability, songwriting_ability, commercial_ability, popularity, reputation, momentum, followers, monthly_listeners, fan_loyalty, ticket_draw, merchandise_strength, streaming_strength, press_interest, industry_interest.

Internal state: chemistry, morale, fatigue, financial_health, creative_satisfaction, tour_satisfaction, label_satisfaction, agent_satisfaction, professionalism, ambition, loyalty, ego, resilience, risk_tolerance, commercial_appetite, artistic_integrity, work_ethic.

Live skills: stage_presence, crowd_interaction, energy, musical_tightness, improvisation, production_value, punctuality, festival_suitability, bad_weather_performance, large_crowd_confidence.

Commercial skills: social_influence, marketability, media_ability, merchandise_appeal, brand_friendliness, audience_crossover, viral_potential.

## band_members

Identity: id, save_id, band_id, name, birth_year, nationality, home_region, role_id, status.

Technical skills: current_ability, potential_ability, vocals, instrument_skill, songwriting, composition, production, creativity, improvisation, stage_presence, crowd_interaction, media_ability.

Mental skills: professionalism, ambition, loyalty, ego, resilience, consistency, adaptability, leadership, discipline, work_ethic.

Health and state: health, fatigue, fitness, voice_condition, hearing_condition, injury_susceptibility, tour_endurance, morale, band_satisfaction, label_satisfaction, agent_satisfaction, weeks_unavailable.

## agents

Identity: id, save_id, name, agency_name, region, reputation.

Attributes: negotiation, industry_contacts, artist_judgement, commercial_judgement, patience, greed, loyalty, aggression, honesty, professionalism.

Strategy: preferred_deal_length, fee_expectation, exclusivity_preference, prestige_focus, client_care.

## labels

Identity: id, save_id, name, founded_year, headquarters, size, genre_id, reputation.

Finances: cash_reserves, annual_revenue, artist_investment_budget, marketing_budget, debt.

Strategy: risk_tolerance, discovery_focus, commercial_focus, genre_purity, development_quality, international_ambition, release_frequency.

## festivals

Identity: id, save_id, company_id, name, founded_year, region, festival_type, genre_id, venue_id, status, is_player_controlled.

Resources: capacity, attendance, cash_reserves, debt, stage_count, days, ticket_price.

Reputation dimensions: overall_prestige, artist_reputation, fan_reputation, industry_reputation, safety_reputation, discovery_reputation, authenticity, commercialism, sustainability, luxury, inclusivity, party_atmosphere, community_connection.

Operations: production_quality, security_quality, transport_quality, camping_quality, sanitation_quality, food_quality, accessibility, medical_quality, weather_resilience, queue_management.

Audience: followers, mailing_list, customer_loyalty, spending_power, travel_tolerance, price_tolerance, sponsor_tolerance.

AI strategy: risk_tolerance, aggression, expansion_ambition, discovery_focus, profit_focus, prestige_focus.

## sponsors

Identity: id, save_id, name, industry, size, region, brand_reputation.

Commercial: annual_budget, minimum_offer, maximum_offer, desired_impressions, attendance_requirement, preferred_contract_years.

Identity: corporate_level, fan_approval, ethical_reputation, sustainability_reputation, youth_appeal, luxury_appeal, genre_fit.

## venues

Identity: id, save_id, name, region, venue_type, owner_name, ownership_status.

Capacity: maximum_capacity, licensed_capacity, camping_capacity, parking_capacity, stage_capacity.

Infrastructure: water, power, drainage, mobile_signal, emergency_access, transport_quality, camping_quality.

Risk and regulation: noise_restriction, curfew_hour, council_difficulty, environmental_sensitivity, flood_risk, wind_exposure, heat_exposure, ground_durability, neighbour_tolerance.

Commercial and brand: rental_cost, purchase_cost, deposit, insurance_requirement, expansion_potential, natural_beauty, uniqueness, brand_potential, accessibility.

## staff

Identity: id, save_id, employer_festival_id, name, birth_year, role_id, contract_end_year, salary, reputation, status.

Skills: negotiation, judgement, potential_assessment, genre_knowledge, regional_knowledge, marketing, operations, financial_management, security, production, leadership, professionalism, loyalty, ambition.

State: morale, fatigue, workload, job_satisfaction, rival_interest.

## relationships and memories

Relationships link any two entities using source_entity_type/source_entity_id and target_entity_type/target_entity_id. Stored dimensions are trust, respect, familiarity, commercial_value and overall_score.

Memories store memory_type, value, description, created_week, decay_per_week and is_permanent. Examples include booked_early, paid_late, broken_promise, great_hospitality and supported_during_crisis.

## events and story arcs

simulation_events store structured facts. news and social content must be generated from these facts.

story_arcs store type, participants JSON, stage, severity, start_week, next_evaluation_week, active status and state JSON.

## hidden truth and player knowledge

Actual ability and potential remain in core entity tables. `festival_band_knowledge` stores estimated ranges, confidence, known traits and last observed week for each festival.
