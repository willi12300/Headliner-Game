PRAGMA foreign_keys = ON;

INSERT OR IGNORE INTO countries(id, name, iso_code) VALUES
('country_gb', 'United Kingdom', 'GB'),
('country_ie', 'Ireland', 'IE'),
('country_us', 'United States', 'US'),
('country_fr', 'France', 'FR'),
('country_de', 'Germany', 'DE'),
('country_nl', 'Netherlands', 'NL'),
('country_es', 'Spain', 'ES');

INSERT OR IGNORE INTO regions(id, country_id, name, population, cost_index, travel_access, media_reach, festival_regulation) VALUES
('region_cheshire', 'country_gb', 'Cheshire', 1100000, 96, 68, 56, 52),
('region_manchester', 'country_gb', 'Greater Manchester', 2860000, 105, 89, 88, 55),
('region_liverpool', 'country_gb', 'Liverpool City Region', 1550000, 93, 82, 75, 50),
('region_bristol', 'country_gb', 'Bristol', 720000, 112, 78, 79, 58),
('region_london', 'country_gb', 'London', 8900000, 165, 96, 100, 72),
('region_brighton', 'country_gb', 'Brighton and Hove', 280000, 122, 78, 76, 65),
('region_yorkshire', 'country_gb', 'Yorkshire', 5500000, 90, 72, 67, 48),
('region_north_wales', 'country_gb', 'North Wales', 700000, 86, 48, 40, 54),
('region_cornwall', 'country_gb', 'Cornwall', 570000, 98, 43, 42, 63),
('region_scottish_borders', 'country_gb', 'Scottish Borders', 116000, 88, 45, 35, 51);
